import { Meta, Result } from '../types/audit';
import { Traces } from '../types/traces';
import * as util from '../utils/utils';
import Audit from './audit';

const MAX_SINGLE_INLINE_ASSET_SIZE = 2048;
export default class AvoidInlineAssetsAudit extends Audit {
	static get meta() {
		return {
			id: 'avoidinlineassets',
			title: `CSS/JS assets are not inlined`,
			failureTitle: `Avoid HTML inlining on big size CSS/JS assets `,
			description: `It’s not recommended to inline big (>2kb) static resources since they can’t be cached on browser memory`,
			category: 'design',
			collectors: ['assetscollect']
		} as Meta;
	}

	static async audit(traces: Traces): Promise<Result> {
		const debug = util.debugGenerator('AvoidInlineAssets Audit');
		debug('running');
		const bigInlineAssets = [
			...traces.css.info.styles,
			...traces.js.info.scripts
		]
			.map(asset => {
				return {
					name: asset.src,
					size: asset.size
				};
			})
			.filter(asset => {
				return asset.size > MAX_SINGLE_INLINE_ASSET_SIZE
			});

		const score = Number(bigInlineAssets.length === 0);

		const meta = util.successOrFailureMeta(AvoidInlineAssetsAudit.meta, score);
		debug('done');

		return {
			meta,
			score,
			scoreDisplayMode: 'binary',
			...(bigInlineAssets.length > 0
				? {
					extendedInfo: {
						value: bigInlineAssets
					}
				}
				: {})
		};
	}
}
