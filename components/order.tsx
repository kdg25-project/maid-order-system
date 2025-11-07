type order = {
  name: string;
  button: string;
};

export function Order({ name, button }: order) {
  return (
    <div>
      <button>これにする</button>
    </div>
  );
}
