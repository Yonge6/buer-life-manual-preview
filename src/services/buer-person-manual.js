import { calculateHumanDesign, localToUtcCandidates } from '../../human-design-engine.js?v=a8bdcfd92951b755';
import { createHumanDesignProfileSnapshot } from '../engine/profile-snapshot.js?v=a8bdcfd92951b755';
import { validateHumanDesignProfileSnapshot } from '../../shared/human-design-profile-contract.js?v=a8bdcfd92951b755';

// Read-only calculation: never touches the main reading, local history or account.
export async function personManualData(person) {
 const snapshot=person?.chart;
 if(!snapshot||!validateHumanDesignProfileSnapshot(snapshot).valid)throw Error('INVALID_CHART');
 const {birthDate,birthTime,timezone,locationLabel}=snapshot.input;
 const [year,month,day]=birthDate.split('-').map(Number),[hour,minute]=birthTime.split(':').map(Number);
 const candidates=localToUtcCandidates(year,month,day,hour,minute,timezone);
 const instant=Date.parse(snapshot.meta.birthUtc);
 if(!candidates.includes(instant))throw Error('INVALID_BIRTH');
 const data=await calculateHumanDesign({name:person.nickname,location:locationLabel,year,month,day,hour,minute,timezone,timeDisambiguation:instant===candidates[0]?'earlier':'later'});
 const rebuilt=await createHumanDesignProfileSnapshot({input:snapshot.input,result:data});
 if(rebuilt.chartHash!==snapshot.chartHash)throw Error('MANUAL_VERSION_CHANGED');
 return data;
}
