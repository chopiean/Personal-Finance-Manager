/** Soft, slowly drifting colour blobs behind the auth screens. */
export default function AuthBackground() {
  return (
    <>
      <span className="auth-blob b1" aria-hidden="true" />
      <span className="auth-blob b2" aria-hidden="true" />
      <span className="auth-blob b3" aria-hidden="true" />
    </>
  );
}
