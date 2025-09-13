type QueryExtensionInfoResponseData = {
    results: {
        extensions: {
            deploymentType: number;
            tags: string[];
            categories: string[];
            installationTargets: {
                target: string;
                targetVersion: string;
            }[];
            publisher: {
                publisherId: string;
                publisherName: string;
                displayName: string;
                flags: string;
                domain: string;
                isDomainVerified: boolean;
            };
            extensionId: string;
            extensionName: string;
            displayName: string;
            flags: string;
            lastUpdated: string;
            publishedDate: string;
            releaseDate: string;
            shortDescription: string;
            versions: {
                version: `${string}.${string}.${string}`;
                flags: string;
                lastUpdated: string;
                files: {
                    assetType: string;
                    source: string;
                }[];
                assetUri: string;
                fallbackAssetUri: string;
            }[];
        }[];
        pagingToken: null;
        resultMetadata: {
            metadataType: string;
            metadataItems: Record<string, unknown>[];
        }[];
    }[];
};

export const queryExtensionInfoFromMarketplace = async (extensionName: `${string}.${string}`): Promise<QueryExtensionInfoResponseData> => {
    const params = {
        assetTypes: null,
        filters: [
            {
                criteria: [{ filterType: 7, value: extensionName }],
                direction: 2,
                pageSize: 100,
                pageNumber: 1,
                sortBy: 0,
                sortOrder: 0,
                pagingToken: null,
            },
        ],
        flags: 2151,
    };

    const response = await fetch(
        `https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery`,
        {
            method: "POST",
            body: JSON.stringify(params),
            headers: {
                "Content-type": "application/json",
                "Accept": "application/json;api-version=7.2-preview.1;excludeUrls=true",
            },
        },
    );

    if (!response.ok) {
        const { status, statusText } = response;
        const body = await response.json();
        // TODO: better error description
        throw new Error(JSON.stringify({ status, statusText, body }, undefined, 4));
    }

    const info = await response.json();

    return info as QueryExtensionInfoResponseData;
};
