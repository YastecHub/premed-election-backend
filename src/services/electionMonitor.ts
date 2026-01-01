import { getSystemConfig } from '../config/database';
import { logger } from '../utils/logger';

export const startElectionMonitoring = (io: any) => {
  setInterval(async () => {
    try {
      const config = await getSystemConfig();

      if (config.isElectionActive && config.endTime && Date.now() > config.endTime.getTime()) {
        config.isElectionActive = false;
        config.updatedAt = new Date();
        await config.save();

        logger.info('Election automatically ended at', new Date().toISOString());
        io.emit('election_ended', { reason: 'Election duration expired' });
      }
    } catch (error) {
      logger.error('Error in election end detection:', error);
    }
  }, 60 * 1000);
};