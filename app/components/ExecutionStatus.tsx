"use client";

type ExecutionStatusProps = {
  amount: string;
  fromToken: string;
  fromChain: string;
  toChain: string;
  receiver: string;
  route: string;
};

export default function ExecutionStatus({
  amount,
  fromToken,
  fromChain,
  toChain,
  receiver,
  route,
}: ExecutionStatusProps) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 18,
        background: "rgba(80,255,140,0.08)",
        border: "1px solid rgba(80,255,140,0.22)",
        color: "white",
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 900,
          marginBottom: 10,
        }}
      >
        Transaction preparation started
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.6, color: "#d8ffd8" }}>
        TRANSPORTAL AI has prepared this route for execution.
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 14,
          background: "#070707",
          border: "1px solid rgba(255,255,255,0.08)",
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        <div>
          <strong>Route:</strong> {route}
        </div>
        <div>
          <strong>Sending:</strong> {amount} {fromToken}
        </div>
        <div>
          <strong>From:</strong> {fromChain}
        </div>
        <div>
          <strong>To:</strong> {toChain}
        </div>
        <div style={{ overflowWrap: "anywhere" }}>
          <strong>Receiver:</strong> {receiver}
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 13,
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.82)",
        }}
      >
        Next build step: connect this prepared object to Mayan/Wormhole SDK so
        your wallet opens for a real signature.
      </div>
    </div>
  );
}