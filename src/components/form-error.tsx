export interface FormErrorProps {
  errors: string[];
}

function FormError({ errors }: FormErrorProps) {
  return errors.map((e, i) => (
    <p key={e + i} className="mt-0.5 text-xs text-red-300">
      {e}
    </p>
  ));
}

export default FormError;
