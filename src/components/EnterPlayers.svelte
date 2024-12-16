<script lang="ts">
	interface Props {
		onsubmit: (players: string[]) => void;
	}
	let { onsubmit }: Props = $props();

	let nextId = $state(1);
	const newPlayer = () => ({ id: nextId++, name: '' });
	const inputs = $state([newPlayer()]);
	let error = $state('');
</script>

<div class="max-w-prose">
	<form
		onsubmit={(e) => {
			e.preventDefault();
			error = '';
			let names = inputs.slice(0, -1).map((p) => p.name);
			if (new Set(names).size < names.length) {
				error = 'All players must have unique names';
				return;
			}
			onsubmit(names);
		}}
	>
		{#each inputs as input, i (input.id)}
			<div class="mt-2">
				<input
					placeholder="Enter a player..."
					name={'player-' + (i + 1)}
					type="text"
					autoComplete="off"
					class="block w-full max-w-96 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
					oninput={(e) => {
						const name = (e.target as HTMLInputElement).value.trim();
						inputs[i].name = name;
						if (i == inputs.length - 1 && name.length > 0) {
							inputs.push(newPlayer());
						}
					}}
					onblur={(e) => {
						const name = (e.target as HTMLInputElement).value.trim();
						if (i < inputs.length - 1 && name.length == 0) {
							inputs.splice(i, 1);
						}
					}}
					onkeydown={(e) => {
						const target = e.target as HTMLInputElement;

						if (e.key === 'Enter' && i != inputs.length - 1) {
							e.preventDefault();
							const nextInput = target.parentElement?.nextElementSibling?.querySelector('input');
							if (nextInput) {
								nextInput.focus();
							}
						} else if (e.key === 'Delete' && i > 0 && target.value.length == 0) {
							e.preventDefault();
							const prevInput =
								target.parentElement?.previousElementSibling?.querySelector('input');
							if (prevInput) {
								prevInput.focus();
							}
						}
					}}
				/>
			</div>
		{/each}
		{#if error}
			<p class="mt-2 text-sm text-red-600">{error}</p>
		{/if}
		<div class="mt-4">
			<button
				type="submit"
				class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			>
				Create Game
			</button>
		</div>
	</form>
</div>
