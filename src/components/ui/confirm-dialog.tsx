import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
	variant?: 'default' | 'destructive';
}

export default function ConfirmDialog({
	isOpen,
	title,
	message,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	onConfirm,
	onCancel,
	variant = 'default',
}: ConfirmDialogProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<Card className="w-full max-w-md mx-4 p-6">
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
					<p className="text-gray-600">{message}</p>
					<div className="flex justify-end gap-3">
						<Button
							variant="outline"
							onClick={onCancel}
						>
							{cancelText}
						</Button>
						<Button
							onClick={onConfirm}
							className={
								variant === 'destructive'
									? 'bg-red-600 hover:bg-red-700 text-white'
									: ''
							}
						>
							{confirmText}
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
