import React, {memo, Suspense, useCallback, useEffect, useState} from 'react';
import useSWR from "swr";
import {ClientComponent} from "./clientComponent";
export const HooksDemo = () => {
  console.log('--------HooksDemo server component');
  const [title, setTitle] = useState("HooksDemo");

  useEffect(() => {
    console.log('hooksDemoのserver componentのuseEffect');
  }, []);
  const changeTitle = useCallback((title: string) => {
    setTitle(title);
  }, []);
  const _dummyChangeTitle = (v: string) => { console.log(v) }
  const dummyChangeTitle = useCallback(_dummyChangeTitle, []);
  return (
    <div>
      <Component1 title={title} changeTitle={changeTitle}/>
      <Component2 title={title} changeTitle={changeTitle}/>
      <Component2 title={"aaaa"} changeTitle={dummyChangeTitle} />
      <ClientComponent title="client componentのタイトル" />
    </div>
  )
}

interface Props1 {
  title: string;
  changeTitle: (v: string) => void;
}
const Component1 = (props: Props1) => {
  // console.log('component1');
  const _changeTitle = useCallback(() => {
    props.changeTitle((new Date()).toISOString());
  }, [props.changeTitle]);

  const { useFetch } = useDemo();
  const { data, error, isLoading } = useFetch();

  // console.log("------------component1");

  // console.log(data);

  return (
    <div>
      {isLoading && <div>loading...</div>}
      {error && <div>error...</div>}
      <h2>{props.title}</h2>
      {/*<Suspense fallback={<div>loading...</div>}>*/}
        <div>
          {data && <h2>{data}</h2>}
        </div>
      {/*</Suspense>*/}

      <button onClick={_changeTitle}>Change Title</button>
    </div>
  )
}

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

const fetcher = () => new Promise((resolve) => {
  // console.log("---------------fetcher--------------fetcher")
  setTimeout(() => {
    resolve({ data: Math.random() });
  }, 700);
});

interface FetchedData {
  data: number | undefined;
  error: any;
  isLoading: boolean;
}
const useDemo = () => {
  const useFetch = (): FetchedData => {
    // console.log('useFetch');
    const { data: _data, error, isLoading } = useSWR('/fetch', fetcher);
    // console.log({ _data, error, isLoading});

    const data = _data as FetchedData

    useEffect(() => {
      // console.log('useEffect', data?.data);
    }, [data?.data, error, isLoading]);

    return {
      data: data?.data,
      error,
      isLoading,
    }
  }
  return {
    useFetch,
  }
}
