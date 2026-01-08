/**
 * Utility to detect and extract subdomain information
 */

export const getSubdomain = () => {
  const hostname = window.location.hostname;
  
  // Development/localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check for subdomain in URL parameter for testing
    const params = new URLSearchParams(window.location.search);
    return params.get('subdomain') || null;
  }
  
  // Production: extract subdomain from hostname
  // Expected formats:
  // - webbuild.arachnova.id (main domain, no subdomain)
  // - client1.webbuild.arachnova.id (subdomain: client1)
  // - 103.175.218.159 (IP address, no subdomain)
  
  const parts = hostname.split('.');
  
  // If it's an IP address, no subdomain
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }
  
  // For webbuild.arachnova.id or similar
  // parts = ['webbuild', 'arachnova', 'id'] -> no subdomain (main domain)
  // parts = ['client1', 'webbuild', 'arachnova', 'id'] -> subdomain: 'client1'
  
  if (parts.length >= 4) {
    // Has subdomain
    return parts[0];
  }
  
  // Main domain or localhost
  return null;
};

export const isMainDomain = () => {
  return getSubdomain() === null;
};

export const getSubdomainSlug = () => {
  const subdomain = getSubdomain();
  return subdomain ? subdomain.toLowerCase() : null;
};

// For development: test with ?subdomain=client1
export const getTestSubdomain = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('subdomain');
};
