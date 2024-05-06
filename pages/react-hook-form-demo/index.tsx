'use client';

import {useForm} from "react-hook-form";

// zodを入れる
export default function ReactHookFormDemo() {
  const { handleSubmit, register, formState, watch, setValue } = useForm()
  console.log(formState);
  console.log(formState.errors)
  console.log('render')
  watch("example")
  const onSubmit = (e: any) => {
    // e.preventDefault()
    console.log("=========onsubmit")
    console.log(e)
  }
  return (
    <div style={{ marginLeft: '1rem' }}>
      <h2>react-hook-formの使い方</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("example", { required: true })}
          style={{ height: '30px', width: '100px' }}
        />
        <input
          type="submit"
          style={{ marginLeft: '30px', height: '30px', width: '100px' }}
        />
      </form>
    </div>
  )
}