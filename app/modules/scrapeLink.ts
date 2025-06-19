import dotenv from 'dotenv';
import { parseLinkedInData } from './parseResponse';
import { parseLinkedInPosts } from './parseResponse';
dotenv.config();

const LINKED_POSTS = process.env.LINKED_POSTS 
const LINKED_PROFILES = process.env.LINKED_PROFILE;
const JINA_API_KEY = process.env.JINA_API_KEY;



if  (!LINKED_POSTS || !LINKED_PROFILES) {
    throw new Error('Environment variables LINKED_POSTS and LINKED_PROFILES must be set');
}


export async function scrapeLink(url: string){
    if (url.includes('linkedin.com/in/')) {
        let scrapedProfile = await scrapeLinkedInProfile(url);
        let scrapedPosts = await scrapeLinkedInPost(url);

        return {
            title: scrapedProfile.title,
            content: scrapedProfile.content + scrapedPosts,
            description: scrapedProfile.description,
        }
    }
    
    else {
        return scrapeJinaLink(url);
    }

}

export async function scrapeLinkedInPost(url: string) {
    const headers = {
        "Authorization": `Bearer ${LINKED_POSTS}`,
        "Content-Type": "application/json"
    };

    try {
        const response = await fetch(`https://api.brightdata.com/datasets/v3/trigger`, {
            method: 'POST',
            headers,
            body: JSON.stringify([{ url }])
        });

        const searchParams = new URLSearchParams({
            dataset_id: "gd_lyy3tktm25m4avu764",
            include_errors: "true",
            type: "discover_new",
            discover_by: "profile_url"
        });
        
        const urlWithParams = `https://api.brightdata.com/datasets/v3/trigger?${searchParams}`;
        
        const finalResponse = await fetch(urlWithParams, {
            method: 'POST',
            headers,
            body: JSON.stringify([{ url }])
        });

        if (!finalResponse.ok) {
            throw new Error(`HTTP error! status: ${finalResponse.status}`);
        }

        const data = await finalResponse.json();
        const snapshotId = data.snapshot_id;
        console.log("Triggered snapshot:", snapshotId);

        if (!snapshotId) {
            throw new Error('Snapshot ID not found in response');
        }
        let status;
        do {
            let pollHeaders = {
                "Authorization": `Bearer ${LINKED_POSTS}`,
                "Content-Type": "application/json"
            };

            const statusResponse = await fetch(`https://api.brightdata.com/datasets/v3/progress/${snapshotId}`, {
                headers: pollHeaders,
            });

            if (!statusResponse.ok) {
                throw new Error(`Failed to fetch snapshot status: ${statusResponse.statusText}`);
            }

            const statusData = await statusResponse.json();
            status = statusData.status;
            console.log("Current snapshot status:", status);

            // Wait for a while before checking the status again
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        while (status !== 'ready');
        
        if (status !== 'ready') {
            throw new Error(`Snapshot did not complete successfully, current status: ${status}`);
        }

        const finalData = await fetch(
            `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}/?format=json`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${LINKED_POSTS}`,
                },
            }
        );

        if (!finalData.ok) {
            throw new Error(`Failed to fetch final data: ${finalData.statusText}`);
        }

        const finalJson = await finalData.json();
        const text = parseLinkedInPosts(finalJson);

        console.log("Parsed LinkedIn post data:", text);
        return text;

    } 
    

    catch (error) {
        console.error("Error scraping LinkedIn post:", error);
        throw error;
    }


}


export async function scrapeLinkedInProfile(url: string){
    if (!url.includes('linkedin.com/in/')) {
        throw new Error('URL must be a LinkedIn profile URL');
    }

    console.log(LINKED_PROFILES);
    
    const headers = {
        "Authorization": `Bearer ${LINKED_PROFILES}`,
        "Content-Type": "application/json"
    };


    try {
        const response = await fetch(`https://api.brightdata.com/datasets/v3/trigger`, {
            method: 'POST',
            headers,
            body: JSON.stringify([{ url }])
        });

        const searchParams = new URLSearchParams({
            dataset_id: "gd_l1viktl72bvl7bjuj0",
            include_errors: "true"
        });
        
        const urlWithParams = `https://api.brightdata.com/datasets/v3/trigger?${searchParams}`;
        
        const finalResponse = await fetch(urlWithParams, {
            method: 'POST',
            headers,
            body: JSON.stringify([{ url }])
        });

        if (!finalResponse.ok) {
            throw new Error(`HTTP error! status: ${finalResponse.status}`);
        }

        const data = await finalResponse.json();
        const snapshotId = data.snapshot_id;
        if (!snapshotId) {
            throw new Error('Snapshot ID not found in response');
        }

        console.log("Triggered snapshot:", snapshotId);

        let status;

        do {
            let pollHeaders = {
                'Authorization': `Bearer ${LINKED_PROFILES}`,
                'Content-Type': 'application/json'
            }
            const statusResponse = await fetch(`https://api.brightdata.com/datasets/v3/progress/${snapshotId}`,{
                headers: pollHeaders,
            });

            if (!statusResponse.ok) {
                throw new Error(`Failed to fetch snapshot status: ${statusResponse.statusText}`);
            }

            const statusData = await statusResponse.json();
            status = statusData.status;

            console.log("Current snapshot status:", status);

            // Wait for a while before checking the status again
            await new Promise(resolve => setTimeout(resolve, 5000));

        } while (status !== 'ready');

        if (status !== 'ready') {
            throw new Error(`Snapshot did not complete successfully, current status: ${status}`);
        }

        const finalData = await fetch(
            `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}/?format=json`,
            {
                method: "GET",        
                headers: {
                    "Authorization": `Bearer ${LINKED_PROFILES}`,
                },
            }
        )
        
        if (!finalData.ok) {
            throw new Error(`Failed to fetch final data: ${finalData.statusText}`);
        }

        const finalJson = await finalData.json();
        console.log(finalJson)


        const finalString = parseLinkedInData(finalJson);
        let name = "";
        if (finalJson.name) {
            name =  finalJson.name;
        }

        return {
            content: finalString,
            title: "LinkedIn Profile: " + name,
            description: "Scraped LinkedIn profile data"
        }
    } 

    catch (error) {
        console.error("Error scraping LinkedIn profile:", error);
        throw error;
    }
}


interface JinaResponse {
    [key: string]: any;
    data: {
        content: string;
        title: string;
        description: string;
        [key: string]: any;
    };
}

export async function scrapeJinaLink(url: string){
   
    const headers = {
        'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
        'Accept': 'application/json',
    }

    const data = await fetch(`https://r.jina.ai/${url}`, {
        method: 'GET',
        headers: headers,
    })
    if (!data.ok) {
        throw new Error(`Failed to fetch data from Jina: ${data.statusText}`);
    }

    const jsonData: JinaResponse = await data.json();
    console.log("Jina data:", jsonData);


    if (!jsonData || !jsonData.data) {
        throw new Error('Invalid response from Jina');
    }

    const content = jsonData.data.content || '';
    const title = jsonData.data.title || 'No title found';
    const description = jsonData.data.description || 'No description found';

    return {
        content: content,
        title: title,
        description: description,
    }
}

