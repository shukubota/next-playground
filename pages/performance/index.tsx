import {HooksDemo} from "../../components/hooksDemo";
import {GetServerSideProps} from "next";

const PerformanceDemo = (props: any) => {
  return (
    <div>
      <h1>Performance Demo</h1>
      <HooksDemo />
    </div>
  )
}

type Repo = {
    name: string
    stargazers_count: number
}

export const getServerSideProps = (async (context) => {
    const res = await fetch('https://api.github.com/repos/vercel/next.js')
    const repo = await res.json();
    return { props: { repo } }
}) satisfies GetServerSideProps<{
    repo: Repo
}>
export default PerformanceDemo;
