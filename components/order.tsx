type order = {
  name: string;
  button: string;
};

export function Order({ name, button }: order) {
  const handleClick = () => {
    console.log(`Order ${name} placed`);
  };
