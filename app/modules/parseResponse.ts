interface Experience {
    title?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    company?: string;
    description_html?: string;
    [key: string]: any; // Allow additional properties

}

interface Education {
    title?: string;
    degree?: string;
    field?: string;
    start_year?: string;
    end_year?: string;
    description_html?: string;
    [key: string]: any; // Allow additional properties
}

interface Award {
    title?: string;
    publication?: string;
    date?: string;
    description?: string;
    [key: string]: any; // Allow additional properties

}

interface LinkedInData {
    id?: string;
    name?: string;
    about?: string;
    experience?: Experience[];
    education?: Education[];
    honors_and_awards?: Award[];
    current_company?: {
        title?: string;
        name?: string;
        [key: string]: any; // Allow additional properties

    };
    [key: string]: any; // Allow additional properties

}

interface Post {
    post_text?: string;
    [key: string]: any; // Allow additional properties

}

interface LinkedInMetaData {
    id: string;
    name: string;
    title: string;
    company: string;
    [key: string]: any; // Allow additional properties

}

function getFirstResult(data: any): any {
    if (Array.isArray(data) && data.length > 0) {
        return data[0];
    }
    return data;
}

function parseLinkedInPosts(response: Post[]): string {
    let parsedPosts = "";
    for (const post of response) {
        parsedPosts += (post.post_text || "") + "\n";
    }
    return parsedPosts.trim();
}

function parseLinkedInData(response: LinkedInData | LinkedInData[]): string {
    const jsonObject: LinkedInData = getFirstResult(response);
    let parsedString = "";

    if (jsonObject.about) {
        parsedString += `About: ${jsonObject.about}\n`;
    }

    if (jsonObject.current_company) {
        const currentCompany = jsonObject.current_company;
        const title = currentCompany.title || "N/A";
        const companyName = currentCompany.name || "N/A";
        parsedString += `Current Company: ${title}(title) at ${companyName}(company)\n`;
    }

    if (jsonObject.experience && Array.isArray(jsonObject.experience)) {
        parsedString += "Experience:\n";
        for (const exp of jsonObject.experience) {
            const title = exp.title || "N/A";
            const location = exp.location || "N/A";
            const startDate = exp.start_date || "N/A";
            const endDate = exp.end_date || "Present";
            const company = exp.company || "N/A";
            const descriptionHtml = exp.description_html || "N/A";

            parsedString += `  - ${title}(title) at ${company}(company) (${location})(location) from ${startDate}(start_data) to ${endDate}(end_data)\n`;
            parsedString += `    Description: ${descriptionHtml}\n`;
        }
    }

    if (jsonObject.education && Array.isArray(jsonObject.education)) {
        parsedString += "Education:\n";
        for (const edu of jsonObject.education) {
            const title = edu.title || "N/A";
            const degree = edu.degree || "N/A";
            const field = edu.field || "N/A";
            const startYear = edu.start_year || "N/A";
            const endYear = edu.end_year || "N/A";
            const description = edu.description_html || "N/A";

            parsedString += `  - ${title}(title) (${degree})(degree) in ${field}(field) from ${startYear}(start_year) to ${endYear}(end_year)\n`;
            parsedString += `    Description: ${description}\n`;
        }
    }

    if (jsonObject.honors_and_awards && Array.isArray(jsonObject.honors_and_awards)) {
        parsedString += "Honors and Awards:\n";
        for (const award of jsonObject.honors_and_awards) {
            const title = award.title || "N/A";
            const publication = award.publication || "N/A";
            const date = award.date || "N/A";
            const description = award.description || "N/A";

            parsedString += `  - ${title}(title) from ${publication}(publication) on ${date}(date)\n`;
            parsedString += `    Description: ${description}\n`;
        }
    }

    return parsedString.trim();
}

function parseLinkedInDataMetaData(response: LinkedInData | LinkedInData[]): LinkedInMetaData {
    const data: LinkedInData = getFirstResult(response);
    return {
        id: data.id || "N/A",
        name: data.name || "N/A",
        title: data.current_company?.title || "N/A",
        company: data.current_company?.name || "N/A",
    };
}

export { parseLinkedInPosts, parseLinkedInData, parseLinkedInDataMetaData };