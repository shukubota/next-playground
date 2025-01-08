'use client';
import {useCallback, useEffect, useState, memo, ReactNode, useMemo, ComponentType} from 'react';

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
      <CountDisplay count={count} />
      {/*{CountDisplay({ count })}*/}
      {/*これは書けない*/}
      {/*{(count % 2 === 0) ? CountDisplay({ count }) : <p>...</p>}*/}
      {/*こっちが正しい*/}
      {/*{(count % 2 === 0) ? <CountDisplay count={count} /> : <p>...</p>}*/}

      <MCount2Display count={count2} />
      <AddButton onClick={add} />
      <AddButton2 onClick={addCount2} />
    </div>
  );
}

const useSample = () => {
  const [isDialogVisible, setIsDialogVisible] = useState(true);

  const [progress, setProgress] = useState(10);
  const _Dialog = ({ progress, Layout }: { progress: number, Layout: ComponentType }) => {
    return (
      <>
        <p className="p-3">progress: {progress}</p>
        <Layout />
      </>
    );
  }

  const Dialog = memo<{ progress: number, Layout: ComponentType }>(_Dialog);

  // eslint-disable-next-line react/display-name
  const createSampleDialogComponent = useCallback(({ Layout }: { Layout: ComponentType }) => () => {
      return isDialogVisible ? (
        <Dialog
          progress={progress}
          Layout={Layout}
        />
      ) : null;
    },
    [isDialogVisible, progress],
  );

  // eslint-disable-next-line react/display-name
  const renderSampleDialogComponent = useCallback(({ Layout }: { Layout: ComponentType }) => {
    return isDialogVisible ? (
      <Dialog
        progress={progress}
        Layout={Layout}
      />
    ) : null;
  }, [isDialogVisible, progress]);

  const toggleDialog = useCallback(() => {
    setIsDialogVisible(prev => !prev);
  }, [setIsDialogVisible]);

  const addProgress = useCallback(() => {
    setProgress(progress => progress + 1);
  }, [setProgress]);

  return {
    createSampleDialogComponent,
    renderSampleDialogComponent,
    toggleDialog,
    addProgress,
  }
}

export const Example = () => {
  const { createSampleDialogComponent, renderSampleDialogComponent, toggleDialog, addProgress } = useSample();

  const SampleDialog = useMemo(() =>
    createSampleDialogComponent({ Layout: DialogLayout }), [createSampleDialogComponent]);

  return (
    <>
      {/*<SampleDialog />*/}
      {renderSampleDialogComponent({ Layout: DialogLayout })}
      <div className="flex justify-evenly p-3">
        <button onClick={toggleDialog}>ダイアログ表示トグル</button>
        <button onClick={addProgress}>progressたすボタン</button>
      </div>
    </>
  )
}

const _DialogLayout = () => {
  console.log("--------DialogLayout rendered")
  return (
    <div className="p-3">
      <p>DialogLayout component</p>
    </div>
  );
}

const DialogLayout = memo(_DialogLayout);

// eslint-disable-next-line react/display-name
const InnerImpl = memo(({ name }: { name: string }) => {
  useEffect(() => {
    console.log(`${name} re-rendered!`);
  }, [])
  return <p>{name}</p>;
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
    <button className="bg-red-400" onClick={onClick}>count1たすボタン</button>
  );
}

const AddButton2 = ({ onClick }: { onClick: () => void }) => {
  console.log('AddButton2 rendered');
  return (
    <button className="bg-blue-400" onClick={onClick}>count2たすボタン</button>
  );
}