export interface Story {
  n: string;
  r: string;
  q: string;
}

export const STORIES: Story[] = [
  { n: "Mama Blessing", r: "Foodstuff · Agege", q: "Before, I dey guess. Now I close the day and I know. Transfer or cash, e dey inside one book." },
  { n: "Adaeze", r: "Fashion · Lekki", q: "Customers wey say ‘I go pay tomorrow’ — their names and items dey wait for them. No more story." },
  { n: "Tunde", r: "Provisions · Aba", q: "I ask for voice how market go today and e answer me. My weekly pattern show me Thursday na my day." },
];

export function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}
