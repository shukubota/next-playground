import {Counter} from "./_components/counter";

const Page = (): JSX.Element => {
  return (
    <div>
      <Counter />
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