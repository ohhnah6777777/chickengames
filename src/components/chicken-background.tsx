import chicken from '@/assets/chicken.png';

export function ChickenBackground() {
  return <div className="chicken-pattern" aria-hidden="true">{Array.from({ length: 200 }, (_, i) => <img key={i} src={chicken} alt="" />)}</div>;
}