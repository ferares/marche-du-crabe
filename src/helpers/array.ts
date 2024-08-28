export function shuffle<T>(input: T[]) {
  const array = [...input]
  for (let index = 0; index < array.length; index++) {
    let randomIndex = Math.floor(Math.random() * index);
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]]
  }
  return array
}