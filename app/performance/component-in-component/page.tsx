import {Component, Counter, Example} from "./_components/counter";

const Page = (): JSX.Element => {
  return (
    <div>
      {/*<Counter />*/}
      <Example />
      {/*<Component />*/}
    </div>
  );
}

export default Page;




// const Dialog = memo<{ progress: number, ... }>(({ ... }) => { ... })
//
// const renderSampleDialogComponent = useCallback(({ Layout }: { Layout: ... }) =>
//   isDialogVisible ? (
//     <Dialog
//       progress={progress}
//       Layout={Layout}
//       ...
// />
// )  : null,
//   [isDialogVisible, progress, ...],
// );
//
// ===========
//
// // 利用側
// const { renderSampleDialogComponent, ... } = useSample();
//
// ...（省略）...
//
// return (
// ...
// {renderSampleDialogComponent({ Layout: DialogLayout })}
// ...
// )