import { Connection } from 'mongoose';
import { WorkSchema } from './work.schema';

export const workProviders = [
  {
    provide: 'WORK_MODEL',
    useFactory: (connection: Connection) => connection.model('Cat', WorkSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];