'use client';
import React, {Suspense, useCallback, useEffect} from "react";
import useSWR from "swr";

interface Props1 {
  title: string;
  changeTitle: (v: string) => void;
}
export const Component1 = (props: Props1) => {
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