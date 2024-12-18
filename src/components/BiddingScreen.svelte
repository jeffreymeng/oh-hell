<script lang="ts">
	import type { Player } from '$lib/game';

	interface Props {
		bidderName: string;
		maxBid: number;
		disabledBid: number | null;
		selectedBid: number | null;
		onBid: (bid: number) => void;
	}
	let { bidderName, maxBid, disabledBid, selectedBid, onBid }: Props = $props();
</script>

<h3 class="py-4 text-center text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
	{bidderName} to bid
</h3>
<div class="relative rounded-xl px-8 pb-4">
	<div class="grid grid-cols-4 gap-4 rounded-lg text-center text-sm font-bold leading-6 text-white">
		{#each Array(maxBid + 1).keys() as i}
			<button
				class="rounded-lg p-4 shadow-lg disabled:bg-blue-400 {i !== selectedBid
					? 'bg-blue-600 hover:bg-blue-500 focus-visible:outline-blue-600'
					: 'bg-green-600 hover:bg-green-500 focus-visible:outline-green-600'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
				disabled={i === disabledBid}
				onclick={() => onBid(i)}
			>
				{i + ''}
			</button>
		{/each}
	</div>
</div>
