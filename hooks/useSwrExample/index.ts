import useSWR from 'swr'
import {useState} from "react";
const _fetchInitData = async (): Promise<number> => {
  await (() => new Promise(r => setTimeout(r, 1000)))()
  const randomValue = Math.floor(Math.random() * 3);
  return randomValue;
}
const _fetchInitData2 = async (): Promise<number> => {
  await (() => new Promise(r => setTimeout(r, 1500)))()
  const randomValue = Math.floor(Math.random() * 300);
  return randomValue;
}

const _fetchAllData = async () => {
  await (() => new Promise(r => setTimeout(r, 3000)))()
  return Promise.all([_fetchInitData(), _fetchInitData2()])
}
export const useSwrExample = () => {
  const [randomValue, setRandomValue] = useState(0);
  const useFetchInitData = () => {
    const first = useSWR('fetchInitData', _fetchInitData)
    const second = useSWR('fetchInitData2', _fetchInitData2)
    const res = useSWR('fetchAll', _fetchAllData)

    console.log(res.data)
    console.log("==========res data")

    const isLoading = !first.data || !second.data;
    console.log(first.data)
    console.log(second.data)
    console.log("----------------88888")

    let data;
    if (isLoading) {
      data = undefined;
    } else {
      data = {
        firstValue: first.data,
        secondValue: second.data,
      }
    }

    const error = first.error || second.error
    const loadStatus = [];
    if (!first.data) {
      loadStatus.push('waiting first!')
    }
    if (!second.data) {
      loadStatus.push('waiting second!')
    }

    const isLoadingAll = res.data === undefined;
    return {
      data,
      error,
      isLoading,
      loadStatus: loadStatus.join(","),
      firstMutate: first.mutate,
      allData: res.data,
      allError: res.error,
      isLoadingAll,
      allMutate: res.mutate,
    };
  }
  return {
    useFetchInitData,
    randomValue,
  }
}