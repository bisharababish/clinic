/**
 * @module PalID
 * Functions to validate, generate, and (stub) verify Palestinian/Israeli ID numbers.
 */

/**
 * Check whether a 9-digit ID is syntactically valid (Luhn check).
 * @param {string} id  A string of exactly 9 digits.
 * @returns {boolean}  True if it passes the Luhn check.
 */
export function isValidPalestinianID(id: string): boolean {
    if (!/^\d{9}$/.test(id)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        const digit = Number(id[i]);
        const weight = (i % 2 === 0) ? 1 : 2;
        const prod = digit * weight;
        sum += (prod < 10 ? prod : prod - 9);
    }
    return (sum % 10) === 0;
}

/**
 * Generate a random, syntactically valid 9-digit ID.
 * @returns {string}  A 9-digit string whose last digit is the correct Luhn check-digit.
 */
export function generatePalestinianID(): string {
    // Generate first 8 random digits
    const base = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));

    // Compute weighted sum
    const sum = base.reduce((acc, digit, i) => {
        const weight = (i % 2 === 0) ? 1 : 2;
        const prod = digit * weight;
        return acc + (prod < 10 ? prod : prod - 9);
    }, 0);

    // Compute check-digit so that (sum + check) % 10 === 0
    const check = (10 - (sum % 10)) % 10;
    return base.join('') + check;
}

/**
 * CKAN API Configuration for gov.il
 */
const CKAN_BASE_URL = "https://data.gov.il";
const CKAN_API_BASE = `${CKAN_BASE_URL}/api/3/action`;

interface CKANResponse<T = unknown> {
    help: string;
    success: boolean;
    result: T;
    error?: {
        message: string;
        __type: string;
    };
}

export interface CKANPackage {
    id: string;
    name: string;
    title: string;
    notes: string;
    resources: CKANResource[];
    organization: {
        name: string;
        title: string;
    };
    tags: Array<{ name: string }>;
    num_resources?: number;
    metadata_created?: string;
    metadata_modified?: string;
}

interface CKANResource {
    id: string;
    name: string;
    description: string;
    format: string;
    url: string;
    package_id: string;
}

/**
 * Search for ID-related datasets in the Israeli government data portal
 */
export async function searchIDDatasets(query: string = "תעודת זהות"): Promise<CKANPackage[]> {
    try {
        const response = await fetch(`${CKAN_API_BASE}/package_search?q=${encodeURIComponent(query)}&rows=20`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'PalestinianIDValidator/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: CKANResponse<{ count: number; results: CKANPackage[] }> = await response.json();

        if (!data.success) {
            throw new Error(data.error?.message || 'API request failed');
        }

        return data.result.results;
    } catch (error) {
        console.error('Error searching ID datasets:', error);
        throw error;
    }
}

/**
 * Get details of a specific dataset that might contain ID validation data
 */
export async function getDatasetDetails(packageId: string): Promise<CKANPackage> {
    try {
        const response = await fetch(`${CKAN_API_BASE}/package_show?id=${packageId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'PalestinianIDValidator/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: CKANResponse<CKANPackage> = await response.json();

        if (!data.success) {
            throw new Error(data.error?.message || 'Failed to get dataset details');
        }

        return data.result;
    } catch (error) {
        console.error('Error getting dataset details:', error);
        throw error;
    }
}

/**
 * Fetch resource data from a dataset (CSV, JSON, etc.)
 */
export async function fetchResourceData(resourceUrl: string, format: string): Promise<string | object> {
    try {
        const response = await fetch(resourceUrl, {
            method: 'GET',
            headers: {
                'Accept': format === 'JSON' ? 'application/json' : 'text/csv',
                'User-Agent': 'PalestinianIDValidator/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (format === 'JSON') {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error) {
        console.error('Error fetching resource data:', error);
        throw error;
    }
}

/**
 * Enhanced ID verification using gov.il CKAN API
 * This function searches for ID-related datasets and attempts validation
 */
export async function fetchIDStatus(id: string): Promise<{
    status: 'valid' | 'invalid' | 'unknown' | 'error';
    message: string;
    source?: string;
    datasets?: CKANPackage[];
}> {
    if (!isValidPalestinianID(id)) {
        return {
            status: 'invalid',
            message: 'ID format is invalid (failed Luhn check)'
        };
    }

    try {
        // Search for ID-related datasets
        const datasets = await searchIDDatasets("תעודת זהות");

        if (datasets.length === 0) {
            return {
                status: 'unknown',
                message: 'No ID validation datasets found in government data portal',
                datasets: []
            };
        }

        // Look for datasets that might contain validation data
        const relevantDatasets = datasets.filter(dataset =>
            dataset.title.includes('תעודת זהות') ||
            dataset.title.includes('זהות') ||
            dataset.notes?.includes('תעודת זהות') ||
            dataset.tags.some(tag => tag.name.includes('זהות'))
        );

        if (relevantDatasets.length === 0) {
            return {
                status: 'unknown',
                message: 'No relevant ID validation datasets found',
                datasets: datasets
            };
        }

        // Try to get detailed information about the first relevant dataset
        const firstDataset = relevantDatasets[0];
        const datasetDetails = await getDatasetDetails(firstDataset.id);

        // Look for resources that might contain ID data
        const dataResources = datasetDetails.resources.filter(resource =>
            resource.format === 'CSV' || resource.format === 'JSON'
        );

        if (dataResources.length === 0) {
            return {
                status: 'unknown',
                message: 'No accessible data resources found for ID validation',
                source: firstDataset.title,
                datasets: relevantDatasets
            };
        }

        // For demonstration, we'll return info about available datasets
        // In a real implementation, you'd need to parse the actual data files
        return {
            status: 'unknown',
            message: `Found ${relevantDatasets.length} relevant datasets. Manual verification required.`,
            source: firstDataset.title,
            datasets: relevantDatasets
        };

    } catch (error) {
        console.error('Error verifying ID with gov.il API:', error);
        return {
            status: 'error',
            message: `API error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

/**
 * Get available datasets related to population/ID data
 */
export async function getAvailableIDDatasets(): Promise<CKANPackage[]> {
    try {
        const searches = [
            "תעודת זהות",
            "זהות",
            "אוכלוסין",
            "רישום אוכלוסין",
            "מרשם האוכלוסין"
        ];

        const allDatasets: CKANPackage[] = [];

        for (const searchTerm of searches) {
            try {
                const datasets = await searchIDDatasets(searchTerm);
                // Avoid duplicates
                const newDatasets = datasets.filter(dataset =>
                    !allDatasets.some(existing => existing.id === dataset.id)
                );
                allDatasets.push(...newDatasets);
            } catch (error) {
                console.warn(`Search failed for term "${searchTerm}":`, error);
            }
        }

        return allDatasets;
    } catch (error) {
        console.error('Error getting available ID datasets:', error);
        throw error;
    }
}

/**
 * Format an ID number with dashes for display (XXX-XX-XXXX)
 */
export function formatIDNumber(id: string): string {
    if (!/^\d{9}$/.test(id)) return id;
    return `${id.slice(0, 3)}-${id.slice(3, 5)}-${id.slice(5)}`;
}

/**
 * Remove formatting from an ID number
 */
export function unformatIDNumber(id: string): string {
    return id.replace(/[^\d]/g, '');
}