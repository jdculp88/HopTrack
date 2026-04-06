import { C } from './recapUtils'

export default function RecapSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="uppercase font-semibold"
      style={{
        fontSize: 10,
        letterSpacing: 1.5,
        color: C.accent,
        margin: '24px 20px 12px',
        paddingLeft: 2,
      }}
    >
      {children}
    </p>
  )
}
