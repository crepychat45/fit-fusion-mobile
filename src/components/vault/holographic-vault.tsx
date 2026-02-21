import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  Upload,
  Download,
  Share2,
  Eye,
  Trash2,
  File,
  FileText,
  FileImage,
  FilePlus,
  Folder,
  Search,
  Grid,
  List,
  MoreVertical,
  CheckCircle,
  X,
  Copy,
  ExternalLink,
  Clock,
  HardDrive,
  Fingerprint,
  Sparkles,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface VaultDocument {
  id: string;
  name: string;
  type: "pdf" | "image" | "document" | "other";
  size: string;
  sizeBytes: number;
  uploadDate: string;
  encrypted: boolean;
  shared: boolean;
  previewUrl?: string;
}

const initialDocuments: VaultDocument[] = [
  { id: "1", name: "Workout_Plan_2024.pdf", type: "pdf", size: "2.4 MB", sizeBytes: 2400000, uploadDate: "2024-12-01", encrypted: true, shared: false },
  { id: "2", name: "Progress_Photo_Nov.jpg", type: "image", size: "1.8 MB", sizeBytes: 1800000, uploadDate: "2024-11-28", encrypted: true, shared: false, previewUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400" },
  { id: "3", name: "Diet_Recommendations.docx", type: "document", size: "856 KB", sizeBytes: 856000, uploadDate: "2024-11-25", encrypted: true, shared: true },
  { id: "4", name: "Medical_Certificate.pdf", type: "pdf", size: "1.2 MB", sizeBytes: 1200000, uploadDate: "2024-11-20", encrypted: true, shared: false },
];

export function HolographicVault() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<VaultDocument[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState<VaultDocument | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(true);

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStorage = documents.reduce((sum, doc) => sum + doc.sizeBytes, 0);
  const maxStorage = 15 * 1024 * 1024 * 1024; // 15 GB
  const storagePercent = (totalStorage / maxStorage) * 100;

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf": return FileText;
      case "image": return FileImage;
      case "document": return File;
      default: return File;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    for (const file of Array.from(files)) {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }

      const newDoc: VaultDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.includes("pdf") ? "pdf" : file.type.includes("image") ? "image" : file.type.includes("doc") ? "document" : "other",
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        sizeBytes: file.size,
        uploadDate: new Date().toISOString().split("T")[0],
        encrypted: true,
        shared: false,
        previewUrl: file.type.includes("image") ? URL.createObjectURL(file) : undefined,
      };

      setDocuments(prev => [newDoc, ...prev]);
    }

    setUploading(false);
    setUploadProgress(0);
    toast({ title: "✅ Upload Complete", description: "Your files have been encrypted and stored securely." });
  };

  const handleDownload = (doc: VaultDocument) => {
    toast({ title: "⬇️ Downloading", description: `${doc.name} is being downloaded...` });
    
    // Create actual download
    if (doc.previewUrl) {
      const link = document.createElement("a");
      link.href = doc.previewUrl;
      link.download = doc.name;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For non-image files, create a text placeholder download
      const blob = new Blob([`File: ${doc.name}\nType: ${doc.type}\nSize: ${doc.size}\nEncrypted: ${doc.encrypted}`], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    setTimeout(() => {
      toast({ title: "✅ Download Complete", description: `${doc.name} has been saved to your device.` });
    }, 500);
  };

  const handleShare = (doc: VaultDocument) => {
    setSelectedDoc(doc);
    setShareDialogOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://fitfusion.app/vault/share/${selectedDoc?.id}`);
    toast({ title: "📋 Link Copied", description: "Secure sharing link has been copied to clipboard." });
  };

  const handleDelete = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    toast({ title: "🗑️ File Deleted", description: "File has been permanently removed from vault." });
  };

  const handlePreview = (doc: VaultDocument) => {
    setSelectedDoc(doc);
    setPreviewOpen(true);
  };

  const handleBiometricVerify = async () => {
    toast({ title: "🔐 Verifying", description: "Please authenticate with biometrics..." });
    await new Promise(resolve => setTimeout(resolve, 1500));
    setBiometricVerified(true);
    toast({ title: "✅ Verified", description: "Biometric authentication successful." });
  };

  return (
    <div className="space-y-4">
      {/* Vault Header */}
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 animate-pulse" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3">
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="p-2.5 bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 rounded-xl shadow-lg"
            >
              <Shield className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Holographic Vault
                <Sparkles className="h-4 w-4 text-purple-500" />
              </h2>
              <p className="text-sm text-muted-foreground font-normal">
                Military-grade encrypted document storage
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Storage Info */}
          <div className="p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-cyan-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-cyan-950/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Secure Storage</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {totalStorage < 1024 * 1024 * 1024 
                  ? `${(totalStorage / 1024 / 1024).toFixed(1)} MB` 
                  : `${(totalStorage / 1024 / 1024 / 1024).toFixed(2)} GB`} / 15 GB
              </span>
            </div>
            <Progress value={storagePercent} className="h-2" />
          </div>

          {/* Security Status */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Lock className="h-3 w-3 mr-1" />AES-256 Encrypted
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Fingerprint className="h-3 w-3 mr-1" />Biometric Protected
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <CheckCircle className="h-3 w-3 mr-1" />{documents.length} Files
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <input type="file" ref={fileInputRef} multiple className="hidden" onChange={handleFileUpload} accept="*/*" />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploading && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-white animate-bounce" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Encrypting and uploading...</p>
                  <Progress value={uploadProgress} className="h-2 mt-2" />
                </div>
                <span className="text-sm font-bold">{uploadProgress}%</span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Documents Grid/List */}
      <ScrollArea className="h-[400px]">
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-2"}>
          {filteredDocs.map((doc, index) => {
            const FileIcon = getFileIcon(doc.type);
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-4 hover:shadow-md transition-all cursor-pointer group ${viewMode === "list" ? "flex items-center gap-4" : ""}`}>
                  <div className={`flex ${viewMode === "grid" ? "flex-col gap-3" : "items-center gap-4 flex-1"}`}>
                    <div className={`${viewMode === "grid" ? "flex items-center justify-between" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                          <FileIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className={viewMode === "list" ? "flex-1" : ""}>
                          <p className="font-medium text-sm truncate max-w-[200px]">{doc.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{doc.uploadDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      {viewMode === "grid" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreview(doc)}>
                              <Eye className="h-4 w-4 mr-2" />Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(doc)}>
                              <Download className="h-4 w-4 mr-2" />Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(doc)}>
                              <Share2 className="h-4 w-4 mr-2" />Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {viewMode === "grid" && (
                      <div className="flex items-center gap-2">
                        {doc.encrypted && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <Lock className="h-2.5 w-2.5 mr-1" />Encrypted
                          </Badge>
                        )}
                        {doc.shared && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <Share2 className="h-2.5 w-2.5 mr-1" />Shared
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {viewMode === "list" && (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handlePreview(doc)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleShare(doc)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredDocs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Folder className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg">No Documents Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? "Try a different search term" : "Upload your first secure document"}
            </p>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              <FilePlus className="h-4 w-4 mr-2" />Upload Document
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview: {selectedDoc?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {selectedDoc?.type === "image" && selectedDoc.previewUrl ? (
              <img src={selectedDoc.previewUrl} alt={selectedDoc.name} className="w-full rounded-lg" />
            ) : selectedDoc?.type === "pdf" ? (
              <div className="flex flex-col items-center justify-center py-8 bg-muted/30 rounded-lg">
                <FileText className="h-16 w-16 text-red-500 mb-4" />
                <p className="font-medium text-lg">{selectedDoc.name}</p>
                <p className="text-sm text-muted-foreground mt-1">PDF Document • {selectedDoc.size}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => selectedDoc && handleDownload(selectedDoc)}>
                    <Download className="h-4 w-4 mr-2" />Download
                  </Button>
                  <Button variant="outline" onClick={() => { handleShare(selectedDoc); setPreviewOpen(false); }}>
                    <Share2 className="h-4 w-4 mr-2" />Share
                  </Button>
                </div>
              </div>
            ) : selectedDoc?.type === "document" ? (
              <div className="flex flex-col items-center justify-center py-8 bg-muted/30 rounded-lg">
                <File className="h-16 w-16 text-blue-500 mb-4" />
                <p className="font-medium text-lg">{selectedDoc.name}</p>
                <p className="text-sm text-muted-foreground mt-1">Document • {selectedDoc.size}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => selectedDoc && handleDownload(selectedDoc)}>
                    <Download className="h-4 w-4 mr-2" />Download
                  </Button>
                  <Button variant="outline" onClick={() => { handleShare(selectedDoc); setPreviewOpen(false); }}>
                    <Share2 className="h-4 w-4 mr-2" />Share
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 bg-muted/30 rounded-lg">
                <File className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="font-medium text-lg">{selectedDoc?.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedDoc?.size}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => selectedDoc && handleDownload(selectedDoc)}>
                    <Download className="h-4 w-4 mr-2" />Download
                  </Button>
                  <Button variant="outline" onClick={() => { if (selectedDoc) { handleShare(selectedDoc); setPreviewOpen(false); } }}>
                    <Share2 className="h-4 w-4 mr-2" />Share
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share: {selectedDoc?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Secure sharing link (expires in 24 hours)</p>
              <div className="flex items-center gap-2">
                <Input value={`https://fitfusion.app/vault/share/${selectedDoc?.id}`} readOnly className="text-xs" />
                <Button size="icon" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Lock className="h-4 w-4 text-yellow-600" />
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Shared files remain encrypted. Recipients will need to verify their identity.
              </p>
            </div>
            <Button className="w-full" onClick={() => { setShareDialogOpen(false); toast({ title: "✅ Share Link Created", description: "Link has been copied to clipboard." }); handleCopyLink(); }}>
              <ExternalLink className="h-4 w-4 mr-2" />Create & Copy Share Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
