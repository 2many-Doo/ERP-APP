/**
 * Utility functions for parsing and processing attachments from API responses
 */

/**
 * Extract attachments array from various possible API response structures
 */
export const extractAttachments = (responseData: any, data: any): any[] => {
  const normalizeObjectAttachments = (obj: any): any[] => {
    if (!obj || Array.isArray(obj) || typeof obj !== "object") return [];
    return Object.entries(obj).flatMap(([key, value]) => {
      if (value === null || value === undefined) return [];

      if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === "object" && !Array.isArray(value[0])) {
          return value.map((v) => ({ ...(v as any), name: (v as any).name || key }));
        }
        return [{ name: key, urls: value }];
      }

      if (typeof value === "object") {
        return [{ ...(value as any), name: (value as any).name || key }];
      }

      return [{ name: key, urls: [value] }];
    });
  };

  // Check responseData.attachements.data first (most common structure)
  if (responseData.attachements?.data && Array.isArray(responseData.attachements.data)) {
    return responseData.attachements.data;
  }
  // Check responseData.attachements (direct array, not nested in data)
  if (responseData.attachements && Array.isArray(responseData.attachements)) {
    return responseData.attachements;
  }
  // Check data.attachements.data
  if (data.attachements?.data && Array.isArray(data.attachements.data)) {
    return data.attachements.data;
  }
  // Check data.attachements (direct array)
  if (data.attachements && Array.isArray(data.attachements)) {
    return data.attachements;
  }
  // Check responseData.attachments.data (alternative spelling)
  if (responseData.attachments?.data && Array.isArray(responseData.attachments.data)) {
    return responseData.attachments.data;
  }
  // Check nested responseData.data.attachments.data
  if (responseData.data?.attachments?.data && Array.isArray(responseData.data.attachments.data)) {
    return responseData.data.attachments.data;
  }
  // Check nested responseData.data.attachments (direct array)
  if (responseData.data?.attachments && Array.isArray(responseData.data.attachments)) {
    return responseData.data.attachments;
  }
  // Check nested data.data.attachments.data
  if (data?.data?.attachments?.data && Array.isArray(data.data.attachments.data)) {
    return data.data.attachments.data;
  }
  // Check nested data.data.attachments (direct array)
  if (data?.data?.attachments && Array.isArray(data.data.attachments)) {
    return data.data.attachments;
  }
  // Check data.attachments.data
  if (data.attachments?.data && Array.isArray(data.attachments.data)) {
    return data.attachments.data;
  }
  // Check data.lease_request_request_attachments (direct property)
  if (data.lease_request_request_attachments && Array.isArray(data.lease_request_request_attachments)) {
    return data.lease_request_request_attachments;
  }
  // Check data.attachments (direct array)
  if (data.attachments && Array.isArray(data.attachments)) {
    return data.attachments;
  }
  // Handle attachments as object map { name: [...] }
  const objectAttachments =
    normalizeObjectAttachments(responseData?.attachments) ||
    normalizeObjectAttachments(responseData?.data?.attachments) ||
    normalizeObjectAttachments(data?.attachments) ||
    normalizeObjectAttachments(data?.data?.attachments);
  if (objectAttachments.length > 0) {
    return objectAttachments;
  }
  return [];
};

/**
 * Extract all URLs from an attachment object
 */
export const getAllUrls = (attachment: any): string[] => {
  // Check for urls array first (primary structure from API)
  if (attachment.urls && Array.isArray(attachment.urls) && attachment.urls.length > 0) {
    const filteredUrls = attachment.urls.filter((url: any) => {
      return url && typeof url === 'string' && url.trim() !== '';
    });
    return filteredUrls;
  }
  
  // Check for single url property (fallback)
  if (attachment.url && typeof attachment.url === 'string' && attachment.url.trim() !== '') {
    return [attachment.url];
  }
  
  // Check for file property (sometimes URLs are in file array)
  if (attachment.file && Array.isArray(attachment.file) && attachment.file.length > 0) {
    const fileUrls = attachment.file
      .filter((file: any) => file && (file.url || file.path))
      .map((file: any) => file.url || file.path)
      .filter((url: any) => url && typeof url === 'string' && url.trim() !== '');
    if (fileUrls.length > 0) {
      return fileUrls;
    }
  }
  
  return [];
};

/**
 * Build attachment map from attachments array
 */
export const buildAttachmentMap = (attachments: any[]): Record<string, any[]> => {
  const attachmentMap: Record<string, any[]> = {};
  
  if (Array.isArray(attachments) && attachments.length > 0) {
    attachments.forEach((attachment: any, idx: number) => {
      if (!attachment) return;
      const name =
        attachment.name ||
        attachment.type ||
        attachment.key ||
        attachment.label ||
        attachment.title ||
        attachment.kind ||
        `attachment_${idx + 1}`;

      const normalized = { ...attachment, name };

      if (!attachmentMap[name]) {
        attachmentMap[name] = [];
      }
      attachmentMap[name].push(normalized);
    });
  }
  
  return attachmentMap;
};

/**
 * Build attachment URLs map from attachment map
 */
export const buildAttachmentUrlsMap = (attachmentMap: Record<string, any[]>): Record<string, string[]> => {
  const attachmentUrlsMap: Record<string, string[]> = {};
  
  Object.keys(attachmentMap).forEach((name) => {
    const attachments = attachmentMap[name] || [];
    const urls: string[] = [];
    attachments.forEach((att: any) => {
      urls.push(...getAllUrls(att));
    });
    attachmentUrlsMap[name] = urls.filter(url => url && url.trim() !== "");
  });
  
  return attachmentUrlsMap;
};

/**
 * Calculate step approval status from attachments
 */
export const getStepApprovalStatus = (attachments: any[]): boolean | null => {
  if (attachments.length === 0) return null;
  
  const hasRejected = attachments.some((att: any) => att.status === "rejected");
  if (hasRejected) return false;
  
  const allApproved = attachments.every((att: any) => att.status === "approved");
  if (allApproved) return true;
  
  return null; // pending
};

