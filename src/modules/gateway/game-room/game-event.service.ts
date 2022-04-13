import { Injectable, Logger, Inject } from '@nestjs/common';

@Injectable()
export class GameEventService {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  GrantJob(data: { playerNum: number; jobData: number[] }) {
    const grantJob = ['CITIZEN', 'MAFIA', 'DOCTOR', 'POLICE']; // 직업

    const Job = []; //해당 방의 직업

    for (let item = 0; item < data.playerNum; item++) {
      const ran = Math.floor(Math.random() * grantJob.length); //직업
      const jobCountData = Job.filter((item) => item === grantJob[ran]).length; //현재 같은 직업 수

      if (jobCountData < data.jobData[ran]) {
        Job.push(grantJob[ran]);
      } else {
        item--;
      }
    }

    return Job;
  }

  shuffle(job: string[]) {
    // 직업 셔플
    const strikeOut = [];
    while (job.length) {
      const lastidx = job.length - 1;
      const roll = Math.floor(Math.random() * job.length);
      const temp = job[lastidx];
      job[lastidx] = job[roll];
      job[roll] = temp;
      strikeOut.push(job.pop());
    }

    return strikeOut;
  }
}
