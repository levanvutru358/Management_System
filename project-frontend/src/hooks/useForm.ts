import { useForm as useReactHookForm, UseFormProps, FieldValues, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';

type UseCustomFormProps<TFieldValues extends FieldValues> = UseFormProps<TFieldValues> & {
  schema?: ZodSchema<TFieldValues>;
};

/**
 * Custom hook để xử lý form với React Hook Form và Zod validation
 * @param props - Cấu hình form bao gồm schema Zod và các options khác
 * @returns UseFormReturn với kiểu dữ liệu của form
 */
export const useCustomForm = <TFieldValues extends FieldValues>({
  schema,
  ...props
}: UseCustomFormProps<TFieldValues>): UseFormReturn<TFieldValues> => {
  const formMethods = useReactHookForm<TFieldValues>({
    ...props,
    resolver: schema ? zodResolver(schema) : undefined,
  });

  return formMethods;
};