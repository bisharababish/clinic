import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    ExternalLink,
    Database,
    ChevronDown,
    Search
} from "lucide-react";
import { fetchIDStatus, getAvailableIDDatasets } from '@/lib/palid';
import type { CKANPackage } from '@/lib/palid';

interface VerificationResult {
    status: 'valid' | 'invalid' | 'unknown' | 'error';
    message: string;
    source?: string;
}

interface IDVerificationProps {
    idNumber: string;
    onVerificationComplete?: (result: VerificationResult) => void;
}

const IDVerification: React.FC<IDVerificationProps> = ({
    idNumber,
    onVerificationComplete
}) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
    const [availableDatasets, setAvailableDatasets] = useState<CKANPackage[]>([]);
    const [showDatasets, setShowDatasets] = useState(false);
    const [isLoadingDatasets, setIsLoadingDatasets] = useState(false);

    const handleVerifyID = async () => {
        if (!idNumber || idNumber.length !== 9) return;

        setIsVerifying(true);
        try {
            const result = await fetchIDStatus(idNumber);
            setVerificationResult(result);
            onVerificationComplete?.(result);
        } catch (error) {
            setVerificationResult({
                status: 'error',
                message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const loadAvailableDatasets = async () => {
        setIsLoadingDatasets(true);
        try {
            const datasets = await getAvailableIDDatasets();
            setAvailableDatasets(datasets);
            setShowDatasets(true);
        } catch (error) {
            console.error('Error loading datasets:', error);
        } finally {
            setIsLoadingDatasets(false);
        }
    };

    const getStatusIcon = () => {
        if (isVerifying) return <Loader2 className="h-4 w-4 animate-spin" />;

        switch (verificationResult?.status) {
            case 'valid':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'invalid':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'unknown':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = () => {
        switch (verificationResult?.status) {
            case 'valid': return 'bg-green-50 border-green-200 text-green-800';
            case 'invalid': return 'bg-red-50 border-red-200 text-red-800';
            case 'unknown': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'error': return 'bg-red-50 border-red-200 text-red-800';
            default: return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    return (
        <div className="space-y-4">
            {/* Verification Button and Status */}
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleVerifyID}
                    disabled={!idNumber || idNumber.length !== 9 || isVerifying}
                    className="flex items-center gap-2"
                >
                    {isVerifying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4" />
                    )}
                    {isVerifying ? 'Verifying...' : 'Verify with Gov.il'}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={loadAvailableDatasets}
                    disabled={isLoadingDatasets}
                    className="flex items-center gap-2"
                >
                    {isLoadingDatasets ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Database className="h-4 w-4" />
                    )}
                    View Datasets
                </Button>
            </div>

            {/* Verification Result */}
            {verificationResult && (
                <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
                    <div className="flex items-start gap-2">
                        {getStatusIcon()}
                        <div className="flex-1">
                            <div className="font-medium">
                                {verificationResult.status === 'valid' && 'ID Valid'}
                                {verificationResult.status === 'invalid' && 'ID Invalid'}
                                {verificationResult.status === 'unknown' && 'Verification Incomplete'}
                                {verificationResult.status === 'error' && 'Verification Error'}
                            </div>
                            <div className="text-sm mt-1">{verificationResult.message}</div>
                            {verificationResult.source && (
                                <div className="text-xs mt-1 opacity-75">
                                    Source: {verificationResult.source}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Available Datasets */}
            {showDatasets && (
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-2">
                            <span className="flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                Available Government Datasets ({availableDatasets.length})
                            </span>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                        {availableDatasets.length === 0 ? (
                            <div className="text-sm text-gray-500 p-2">No datasets found</div>
                        ) : (
                            availableDatasets.slice(0, 5).map((dataset) => (
                                <div key={dataset.id} className="border rounded p-3 text-sm">
                                    <div className="font-medium">{dataset.title}</div>
                                    <div className="text-gray-600 mt-1">{dataset.notes}</div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex gap-1">
                                            {dataset.tags.slice(0, 3).map((tag) => (
                                                <Badge key={tag.name} variant="secondary" className="text-xs">
                                                    {tag.name}
                                                </Badge>
                                            ))}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                            className="h-6 px-2"
                                        >
                                            <a
                                                href={`https://data.gov.il/dataset/${dataset.name}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                View
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CollapsibleContent>
                </Collapsible>
            )}
        </div>
    );
};

export default IDVerification;