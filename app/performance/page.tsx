import {HooksDemo} from "../../components/hooksDemo";

const PerformanceDemo = async (props: any) => {
  const res = await fetch('https://api.github.com/repos/vercel/next.js')
  const repo = await res.json();
  console.log({ repo });
  return (
    <div>
      <h1>Performance Demo</h1>
      <HooksDemo />
    </div>
  )
}

// type Repo = {
//     name: string
//     stargazers_count: number
// }

// export const getServerSideProps = (async (context) => {
//     const res = await fetch('https://api.github.com/repos/vercel/next.js')
//     const repo = await res.json();
//     return { props: { repo } }
// }) satisfies GetServerSideProps<{
//     repo: Repo
// }>
export default PerformanceDemo;
