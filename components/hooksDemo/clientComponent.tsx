'use client';

import {useEffect} from "react";

interface Props {
  title: string;
}
const ClientComponent = (props: Props) => {
  console.log('--------client component');
  console.log(props.title);
  // console.log(window.history);

  useEffect(() => {
    console.log('------ClientComponentのuseEffect');
  });

  return (
    <div>
      <p>{props.title}</p>
    </div>
  );
}

export { ClientComponent };
