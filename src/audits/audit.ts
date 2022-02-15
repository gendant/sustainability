import { AuditType, Meta } from '../types/audit';
import { Traces } from '../types/traces';

export default class Audit {
	static get meta(): Meta {
		return {} as Meta;
	}

	static async audit(
		traces: Traces
	): Promise<AuditType>
 {
		return {} as Promise<AuditType>;
	}
}
