import React, {memo, Suspense, useCallback, useEffect, useState} from 'react';
import useSWR from "swr";
import {ClientComponent} from "./clientComponent";
import {Component1} from "./component1";
export const HooksDemo = () => {
  console.log('--------HooksDemo server component');
  const [title, setTitle] = useState("HooksDemo");

  // @ts-ignore
  useEffect(() => {
    console.log('hooksDemoのserver componentのuseEffect');
  }, []);
  const changeTitle = useCallback((title: string) => {
    setTitle(title);
  }, []);

  // const a = await fetcher();
  // console.log({ a });
  const _dummyChangeTitle = (v: string) => { console.log(v) }
  const dummyChangeTitle = useCallback(_dummyChangeTitle, []);
  return (
    <div>
      <Component1 title={title} changeTitle={changeTitle}/>
      <Component2 title={title} changeTitle={changeTitle}/>
      <Component2 title={"aaaa"} changeTitle={dummyChangeTitle} />
      <ClientComponent title="client componentのタイトル" />
      <button onClick={() => { console.log("onclick---------------")}}>
        なんか押せるボタン
      </button>
    </div>
  )
}

const fetcher = () => new Promise((resolve) => {
  // console.log("---------------fetcher--------------fetcher")
  setTimeout(() => {
    resolve({ data: Math.random() });
  }, 700);
});

interface Props2 {
  title: string;
  changeTitle: (v: string) => void;
}

const _Component2 = (props: Props2) => {
  // console.log('component2', props.title);
  return (
    <div>
      <h2>{props.title}</h2>
    </div>
  )
}

const Component2 = memo(_Component2);
