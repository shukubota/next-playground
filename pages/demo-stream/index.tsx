import dynamic from "next/dynamic";
import DemoStreamDetail from "../../components/demoStreamDetail";

const NoSSRDemoStreamDetail = dynamic(() => import("../../components/demoStreamDetail"), { ssr: true });
export default function DemoStream() {
  return (
    <>
      {/*<NoSSRDemoStreamDetail />*/}
      <DemoStreamDetail />
    </>
  )
}
