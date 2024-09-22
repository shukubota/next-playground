'use client';
import {useCallback, useEffect, useState} from 'react';

export const Counter = () => {
  const [count, setCount] = useState<number>(0);

  const [count2, setCount2] = useState<number>(0);

  const add = useCallback(() => {
    setCount(count => count + 1);
  }, [setCount]);

  const addCount2 = useCallback(() => {
    setCount2(count => count + 1);
  }, [setCount2]);

  return (
    <>
      {(count % 2 === 0) ? CountDisplay({ count }) : <p>...</p>}
      {/*{(count % 2 === 0) ? <CountDisplay count={count} /> : <p>...</p>}*/}
      {/*{Count2Display({ count: count2 })}*/}
      <AddButton onClick={add} />
      {/*<AddButton2 onClick={addCount2} />*/}
    </>
  );
}

const CountDisplay = ({ count }: { count: number }) => {
  console.log({ count });

  useEffect(() => {
    console.log('CountDisplay rendered------------');
  }, [count]);
  return (
    <p>Count: {count}</p>
  );
}

const Count2Display = ({ count }: { count: number }) => {
  console.log({ count });
  useEffect(() => {
    console.log('Count2Display rendered------------');
  }, [count]);
  return (
    <p>Count: {count}</p>
  );
}

const AddButton = ({ onClick }: { onClick: () => void }) => {
  console.log('AddButton rendered');
  return (
    <button className="bg-red-400" onClick={onClick}>1たすボタン</button>
  );
}

const AddButton2 = ({ onClick }: { onClick: () => void }) => {
  console.log('AddButton2 rendered');
  return (
    <button className="bg-blue-400" onClick={onClick}>1たすボタン</button>
  );
}