import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Loader2,
    Search,
    Database,
    ExternalLink,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    FileText,
    Download,
    Eye,
    Calendar,
    Users,
    Building
} from "lucide-react";
import {
    isValidPalestinianID,
    generatePalestinianID,
    formatIDNumber,
    searchIDDatasets,
    getAvailableIDDatasets,
    fetchIDStatus,
    getDatasetDetails,
    fetchResourceData,
    type CKANPackage
} from '@/lib/palid';

// Define the verification result type
interface VerificationResult {
    status: 'valid' | 'invalid' | 'unknown' | 'error';
    message: string;
    source?: string;
    datasets?: CKANPackage[];
}

const CKANAPITester: React.FC = () => {
    // State for ID testing
    const [testId, setTestId] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

    // State for dataset exploration
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('תעודת זהות');
    const [searchResults, setSearchResults] = useState<CKANPackage[]>([]);
    const [allDatasets, setAllDatasets] = useState<CKANPackage[]>([]);

    // State for dataset details
    const [selectedDataset, setSelectedDataset] = useState<CKANPackage | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [datasetDetails, setDatasetDetails] = useState<CKANPackage | null>(null);

    // State for API status
    const [apiStatus, setApiStatus] = useState<'unknown' | 'working' | 'error'>('unknown');

    const generateTestId = () => {
        const id = generatePalestinianID();
        setTestId(id);
    };

    const verifyId = async () => {
        if (!testId || testId.length !== 9) return;

        setIsVerifying(true);
        try {
            const result = await fetchIDStatus(testId);
            setVerificationResult(result);
            setApiStatus('working');
        } catch (error) {
            setVerificationResult({
                status: 'error',
                message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
            setApiStatus('error');
        } finally {
            setIsVerifying(false);
        }
    };

    const searchDatasets = async () => {
        setIsSearching(true);
        try {
            const results = await searchIDDatasets(searchQuery);
            setSearchResults(results);
            setApiStatus('working');
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            setApiStatus('error');
        } finally {
            setIsSearching(false);
        }
    };

    const loadAllDatasets = async () => {
        setIsSearching(true);
        try {
            const datasets = await getAvailableIDDatasets();
            setAllDatasets(datasets);
            setApiStatus('working');
        } catch (error) {
            console.error('Error loading datasets:', error);
            setAllDatasets([]);
            setApiStatus('error');
        } finally {
            setIsSearching(false);
        }
    };

    const loadDatasetDetails = async (dataset: CKANPackage) => {
        setSelectedDataset(dataset);
        setIsLoadingDetails(true);
        try {
            const details = await getDatasetDetails(dataset.id);
            setDatasetDetails(details);
        } catch (error) {
            console.error('Error loading dataset details:', error);
            setDatasetDetails(null);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const getStatusIcon = () => {
        switch (apiStatus) {
            case 'working':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    // Test API connection on component mount
    useEffect(() => {
        const testConnection = async () => {
            try {
                await searchIDDatasets('test');
                setApiStatus('working');
            } catch (error) {
                setApiStatus('error');
            }
        };
        testConnection();
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        CKAN API Integration Tester
                        {getStatusIcon()}
                    </CardTitle>
                    <CardDescription>
                        Test integration with Israeli Government Data Portal (data.gov.il) for ID verification
                    </CardDescription>
                </CardHeader>
            </Card>

            <Tabs defaultValue="id-verification" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="id-verification">ID Verification</TabsTrigger>
                    <TabsTrigger value="dataset-search">Dataset Search</TabsTrigger>
                    <TabsTrigger value="dataset-explorer">Dataset Explorer</TabsTrigger>
                    <TabsTrigger value="api-status">API Status</TabsTrigger>
                </TabsList>

                {/* ID Verification Tab */}
                <TabsContent value="id-verification">
                    <Card>
                        <CardHeader>
                            <CardTitle>ID Number Verification</CardTitle>
                            <CardDescription>
                                Test Palestinian ID validation with government datasets
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter 9-digit ID number"
                                    value={testId}
                                    onChange={(e) => setTestId(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                    maxLength={9}
                                    className="font-mono"
                                />
                                <Button onClick={generateTestId} variant="outline">
                                    Generate Sample
                                </Button>
                                <Button
                                    onClick={verifyId}
                                    disabled={testId.length !== 9 || isVerifying}
                                    className="min-w-32"
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4 mr-2" />
                                            Verify ID
                                        </>
                                    )}
                                </Button>
                            </div>

                            {testId.length === 9 && (
                                <div className="space-y-2 p-3 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Format Check:</span>
                                        {isValidPalestinianID(testId) ? (
                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                                Valid Format
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive">
                                                Invalid Format
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Formatted: <code className="bg-white px-1 rounded">{formatIDNumber(testId)}</code>
                                    </div>
                                </div>
                            )}

                            {verificationResult && (
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="flex items-start gap-3">
                                            {verificationResult.status === 'valid' && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                                            {verificationResult.status === 'invalid' && <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                                            {verificationResult.status === 'unknown' && <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                                            {verificationResult.status === 'error' && <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}

                                            <div className="flex-1">
                                                <div className="font-medium">
                                                    {verificationResult.status === 'valid' && 'ID Verified'}
                                                    {verificationResult.status === 'invalid' && 'ID Not Found'}
                                                    {verificationResult.status === 'unknown' && 'Verification Incomplete'}
                                                    {verificationResult.status === 'error' && 'Verification Error'}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {verificationResult.message}
                                                </div>
                                                {verificationResult.source && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Source: {verificationResult.source}
                                                    </div>
                                                )}
                                                {verificationResult.datasets && verificationResult.datasets.length > 0 && (
                                                    <div className="mt-2">
                                                        <div className="text-sm font-medium">Related Datasets Found:</div>
                                                        <div className="mt-1 space-y-1">
                                                            {verificationResult.datasets.slice(0, 3).map((dataset) => (
                                                                <div key={dataset.id} className="text-xs text-blue-600 hover:text-blue-800">
                                                                    <a href={`https://data.gov.il/dataset/${dataset.name}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                                                        <ExternalLink className="h-3 w-3" />
                                                                        {dataset.title}
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Dataset Search Tab */}
                <TabsContent value="dataset-search">
                    <Card>
                        <CardHeader>
                            <CardTitle>Search Government Datasets</CardTitle>
                            <CardDescription>
                                Search for datasets related to ID verification and population data
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Search datasets (Hebrew/English)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button onClick={searchDatasets} disabled={isSearching}>
                                    {isSearching ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Search className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button onClick={loadAllDatasets} variant="outline" disabled={isSearching}>
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery('תעודת זהות')}
                                    className="justify-start"
                                >
                                    תעודת זהות (ID Card)
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery('מרשם אוכלוסין')}
                                    className="justify-start"
                                >
                                    מרשם אוכלוסין (Population Registry)
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery('זהות')}
                                    className="justify-start"
                                >
                                    זהות (Identity)
                                </Button>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-medium">Search Results ({searchResults.length})</h3>
                                    <ScrollArea className="h-96">
                                        <div className="space-y-3">
                                            {searchResults.map((dataset) => (
                                                <Card key={dataset.id} className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => loadDatasetDetails(dataset)}>
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-sm">{dataset.title}</h4>
                                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                                    {dataset.notes}
                                                                </p>
                                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                                    <span className="flex items-center gap-1">
                                                                        <FileText className="h-3 w-3" />
                                                                        {dataset.resources?.length || 0} resources
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Building className="h-3 w-3" />
                                                                        {dataset.organization?.title}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {dataset.metadata_modified ? formatDate(dataset.metadata_modified) : 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex gap-1 mt-2">
                                                                    {dataset.tags?.slice(0, 3).map((tag) => (
                                                                        <Badge key={tag.name} variant="secondary" className="text-xs">
                                                                            {tag.name}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <a href={`https://data.gov.il/dataset/${dataset.name}`}
                                                                    target="_blank" rel="noopener noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}>
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Dataset Explorer Tab */}
                <TabsContent value="dataset-explorer">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dataset Details Explorer</CardTitle>
                            <CardDescription>
                                {selectedDataset ? `Exploring: ${selectedDataset.title}` : 'Click on a dataset from search results to explore its details'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedDataset ? (
                                <div className="space-y-4">
                                    {isLoadingDetails ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <span className="ml-2">Loading dataset details...</span>
                                        </div>
                                    ) : datasetDetails ? (
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-medium">{datasetDetails.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{datasetDetails.notes}</p>
                                            </div>

                                            <Separator />

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium">Organization:</span>
                                                    <p>{datasetDetails.organization?.title}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Last Updated:</span>
                                                    <p>{datasetDetails.metadata_modified ? formatDate(datasetDetails.metadata_modified) : 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Created:</span>
                                                    <p>{datasetDetails.metadata_created ? formatDate(datasetDetails.metadata_created) : 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Resources:</span>
                                                    <p>{datasetDetails.resources?.length || 0} files</p>
                                                </div>
                                            </div>

                                            {datasetDetails.resources && datasetDetails.resources.length > 0 && (
                                                <div>
                                                    <h4 className="font-medium mb-2">Resources</h4>
                                                    <div className="space-y-2">
                                                        {datasetDetails.resources.map((resource) => (
                                                            <Card key={resource.id}>
                                                                <CardContent className="p-3">
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="flex-1">
                                                                            <h5 className="text-sm font-medium">{resource.name}</h5>
                                                                            <p className="text-xs text-gray-600 mt-1">{resource.description}</p>
                                                                            <div className="flex items-center gap-2 mt-2">
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    {resource.format}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-1">
                                                                            <Button variant="ghost" size="sm" asChild>
                                                                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                                                                    <Eye className="h-3 w-3" />
                                                                                </a>
                                                                            </Button>
                                                                            <Button variant="ghost" size="sm" asChild>
                                                                                <a href={resource.url} download>
                                                                                    <Download className="h-3 w-3" />
                                                                                </a>
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            Failed to load dataset details
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Select a dataset from the search results to view its details
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* API Status Tab */}
                <TabsContent value="api-status">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                API Connection Status
                                {getStatusIcon()}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="font-medium">Base URL:</span>
                                    <p className="text-sm text-gray-600">https://data.gov.il/api/3/action</p>
                                </div>
                                <div>
                                    <span className="font-medium">Status:</span>
                                    <p className="text-sm">
                                        {apiStatus === 'working' && <span className="text-green-600">Connected</span>}
                                        {apiStatus === 'error' && <span className="text-red-600">Connection Error</span>}
                                        {apiStatus === 'unknown' && <span className="text-yellow-600">Unknown</span>}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-medium mb-2">Available Endpoints</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>/action/package_search</span>
                                        <Badge variant="outline">GET</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>/action/package_show</span>
                                        <Badge variant="outline">GET</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>/action/resource_show</span>
                                        <Badge variant="outline">GET</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>/action/organization_list</span>
                                        <Badge variant="outline">GET</Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-medium mb-2">Usage Statistics</h4>
                                <div className="text-sm text-gray-600">
                                    <p>• Search Results: {searchResults.length}</p>
                                    <p>• All Datasets Loaded: {allDatasets.length}</p>
                                    <p>• Verification Attempts: {verificationResult ? 1 : 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CKANAPITester;