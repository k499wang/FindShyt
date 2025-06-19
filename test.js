import dotenv from 'dotenv';
dotenv.config();

const LINKED_POSTS = process.env.LINKED_POSTS 
const LINKED_PROFILES = process.env.LINKED_PROFILES;
const JINA_API_KEY = process.env.JINA_API_KEY;


export async function scrapeJinaLink(url) {
   
    const headers = {
        'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
    }

    const data = await fetch(`https://r.jina.ai/${url}`)
    if (!data.ok) {
        throw new Error(`Failed to fetch data from Jina: ${data.statusText}`);
    }

    const jsonData = data.json();
    console.log("Jina data:", jsonData);
}
