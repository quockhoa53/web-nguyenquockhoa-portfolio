export function AsyncState({ title, text }) {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {text && <p className="mt-3 text-slate-600">{text}</p>}
      </div>
    </main>
  )
}
