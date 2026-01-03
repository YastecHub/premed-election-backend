import { ValidationError } from './base';

export function validateElection(data: any) {
  if (data.votedIps !== undefined) {
    if (!Array.isArray(data.votedIps)) {
      throw new ValidationError('votedIps', 'Voted IPs must be an array');
    }
    
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^::1$|^localhost$/;
    
    for (const ip of data.votedIps) {
      if (typeof ip !== 'string') {
        throw new ValidationError('votedIps', 'All IP addresses must be strings');
      }
      
      if (!ipRegex.test(ip) && ip !== '::ffff:127.0.0.1') {
        throw new ValidationError('votedIps', `Invalid IP address format: ${ip}`);
      }
    }
  }
};