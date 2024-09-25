'use client';
import {useCallback, useEffect, useState, memo, ReactNode, useMemo} from 'react';

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
    <div className="p-3">
      {/*これは書けない*/}
      {/*{(count % 2 === 0) ? CountDisplay({ count }) : <p>...</p>}*/}
      {/*こっちが正しい*/}
      {(count % 2 === 0) ? <CountDisplay count={count} /> : <p>...</p>}

      <MCount2Display count={count2} />
      <AddButton onClick={add} />
      <AddButton2 onClick={addCount2} />
    </div>
  );
}

const useSample = () => {
  const [isDialogVisible, setIsDialogVisible] = useState(true);

  const [progress, setProgress] = useState(10);
  const _Dialog = ({ progress, Layout }: { progress: number, Layout: ReactNode }) => {
    console.log('Dialog rendered----------');
    return (
      <>
        <p className="p-3">progress: {progress}</p>
        {Layout}
      </>
    );
  }

  const Dialog = memo<{ progress: number, Layout: ReactNode }>(_Dialog);

  const createSampleDialogComponent = useCallback(({ Layout }: { Layout: ReactNode }) =>
    // eslint-disable-next-line react/display-name
    () =>
      isDialogVisible ? (
        <Dialog
          progress={progress}
          Layout={Layout}
        />
      )  : null,
    [isDialogVisible, progress],
  );

  const toggleDialog = useCallback(() => {
    setIsDialogVisible(prev => !prev);
  }, [setIsDialogVisible]);

  const addProgress = useCallback(() => {
    setProgress(progress => progress + 1);
  }, [setProgress]);

  return {
    createSampleDialogComponent,
    toggleDialog,
    addProgress,
  }
}

export const Example = () => {
  const { createSampleDialogComponent, toggleDialog, addProgress } = useSample();

  const SampleDialog = useMemo(() =>
    createSampleDialogComponent({ Layout: <DialogLayout /> }), [createSampleDialogComponent]);

  return (
    <>
      <SampleDialog />
      {/*{createSampleDialogComponent({ Layout: <DialogLayout /> })}*/}
      <div className="flex justify-evenly p-3">
        <button onClick={toggleDialog}>ダイアログ表示トグル</button>
        <button onClick={addProgress}>progressたすボタン</button>
      </div>
    </>
  )
}

// const DialogLayout = () => <p>aaa</p>

const _DialogLayout = () => {
  // const [count, setCount] = useState<number>(0);
  // const addCount = useCallback(() => {
  //   setCount(count => count + 1);
  // }, [setCount]);

  console.log("--------DialogLayout rendered")
  return (
    <div className="p-3">
      <p>DialogLayout component</p>
      {/*<p>count: {count}</p>*/}
      {/*<button onClick={addCount}>countたすボタン</button>*/}
    </div>
  );
}

const DialogLayout = memo(_DialogLayout);

// ----------
// eslint-disable-next-line react/display-name
const InnerImpl = memo(({ name }: { name: string }) => {
  useEffect(() => {
    console.log(`${name} re-rendered!`);
  }, [])
  return null
});

export const Component = () => {
  const [state, setState] = useState("default");

  useEffect(() => {
    setTimeout(() => {
      setState("updated");
    }, 2000);
  }, []);

  const InnerComponent = useCallback(() => {
    return <InnerImpl name="asComponent" />;
  }, [state]);

  const renderInner = useCallback(() => {
    // InnerImpl は state への依存がない
    return <InnerImpl name="asFunction" />;
  }, [state]);

  return (
    <>
      <InnerComponent />
      {renderInner()}
    </>
  );
};


const CountDisplay = ({ count }: { count: number }) => {
  console.log({ count });

  useEffect(() => {
    console.log('CountDisplay rendered------------');
  }, [count]);
  return (
    <p>Count1: {count}</p>
  );
}

const Count2Display = ({ count }: { count: number }) => {
  console.log({ count });
  useEffect(() => {
    console.log('Count2Display rendered------------');
  }, [count]);
  return (
    <p>Count2: {count}</p>
  );
}

const MCount2Display = memo(Count2Display);

const AddButton = ({ onClick }: { onClick: () => void }) => {
  console.log('AddButton rendered');
  return (
    <button className="bg-red-400" onClick={onClick}>count2たすボタン</button>
  );
}

const AddButton2 = ({ onClick }: { onClick: () => void }) => {
  console.log('AddButton2 rendered');
  return (
    <button className="bg-blue-400" onClick={onClick}>count2たすボタン</button>
  );
}