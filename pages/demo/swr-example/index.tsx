import {useSwrExample} from "../../../hooks/useSwrExample";

const SwrExample = () => {
  const { useFetchInitData, randomValue } = useSwrExample();
  const {
    data,
    error,
    isLoading,
    loadStatus,
    firstMutate,
    allData,
    allError,
    isLoadingAll,
    allMutate,
  } = useFetchInitData();

  console.log(data)
  console.log(error)
  const onMutate = async () => {
    console.log('fetchInitData')
    const r = await firstMutate(123)
    console.log({ r })
  }
  const _allMutate = async () => {
    const r = await allMutate([1, 2])
    console.log({ r })
  }
  return (
    <div>
      <p>isLoading: { isLoading }</p>
      <p>load status: {loadStatus}</p>
      <p>isLoadingAll: {isLoadingAll}</p>
      {isLoading ?
        <p>loading...</p> : (
        <>
          <p>randomValue: { data?.firstValue }</p>
          <p>randomValue: { data?.secondValue }</p>
        </>)
      }
      <button onClick={onMutate}>
        mutate
      </button>
      <p>error: { error }</p>
      {isLoadingAll ?
        <p>loadingAll...</p> : (
          <>
            <p>firstRandomValue: { allData?.[0] }</p>
            <p>secondRandomValue: { allData?.[1] }</p>
          </>)
      }
      <button onClick={_allMutate}>
        allMutate
      </button>
    </div>
  )
}

export default SwrExample;