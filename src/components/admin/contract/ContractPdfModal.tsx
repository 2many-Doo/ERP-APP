import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    url?: string;
    loading?: boolean;
    filename?: string;
};

const ContractPdfModal: React.FC<Props> = ({ open, onOpenChange, url, loading = false, filename }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Гэрээ PDF</DialogTitle>
                    <DialogDescription>{filename || "PDF үзэх"}</DialogDescription>
                </DialogHeader>
                <div className="h-[70vh] border rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-slate-500">
                            Ачааллаж байна...
                        </div>
                    ) : url ? (
                        <iframe src={url} className="w-full h-full" title="contract-pdf" />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500">
                            PDF олдсонгүй
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ContractPdfModal;
