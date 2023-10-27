export function randomString(length: number): string{
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

export const mutateString = (input: string, percent: number): string[] => {
    if (percent < 0 || percent > 1) {
        console.warn(`\x1b[33mPercent must be in the 0-1 number range.`)
        return []
    }
    const mutations: string[] = [];
    const numMutations = percent * Number(input.length.toFixed(0))
    
    for (let i: number = 0; i < numMutations; i++) {
        let mutatedString: string = input.slice();
        const numChanges: number = Math.floor(Math.random() * 5) + 1; // max 5 changes
  
        for (let j: number = 0; j < numChanges; j++) {
            const randomIndex: number = Math.floor(Math.random() * mutatedString.length);
            const randomChar: string = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
  
            const mutationType: number = Math.floor(Math.random() * 3);
            if (mutationType === 0) {
                // replace
                mutatedString =
                    mutatedString.slice(0, randomIndex) + randomChar + mutatedString.slice(randomIndex + 1);
            } else if (mutationType === 1) {
                // insert
                mutatedString = mutatedString.slice(0, randomIndex) + randomChar + mutatedString.slice(randomIndex);
            } else {
                // delete
                mutatedString = mutatedString.slice(0, randomIndex) + mutatedString.slice(randomIndex + 1);
            }
        }
  
        mutations.push(mutatedString);
    }
  
    return mutations;
}