'use client';

interface Props {
  title: string;
}
const ClientComponent = (props: Props) => {
  console.log('--------client component');
  console.log(props.title);

  return (
    <div>
      <p>{props.title}</p>
    </div>
  );
}

export { ClientComponent };
