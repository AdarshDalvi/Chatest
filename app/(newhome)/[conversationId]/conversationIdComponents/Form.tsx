'use client';

import ChatScreenInput from './FormComponents/Input';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { Image as ImageInterface } from '@prisma/client';
import toast from 'react-hot-toast';
import createSecureUrl from '@/app/lib/secureUrl';
import ImageInputModal from '../../components/ImageComponents/Modals/ImageInputModal';

function Form({ conversationId }: { conversationId: string }) {
    const {
        handleSubmit: handleSubmitText,
        register: registerText,
        reset: resetText,
    } = useForm<FieldValues>();

    const {
        handleSubmit: handleSubmitImage,
        register: registerImage,
        reset: resetImageCaption,
    } = useForm<FieldValues>({ defaultValues: { caption: '' } });

    const [image, setImage] = useState<ImageInterface | null>(null);
    const [loading, setLoading] = useState(false);

    const handleTextInputSend: SubmitHandler<FieldValues> = (data) => {
        resetText();
        axios.post('/api/messages', { ...data, conversationId });
    };

    const handleImageChange = async (file: File | null) => {
        if (!file) {
            toast.error('Something went wrong!');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const image = new Image();
            image.onload = () => {
                setImage({
                    src: image.src,
                    caption: null,
                    width: image.width,
                    height: image.height,
                });
            };
            image.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleImageSend: SubmitHandler<FieldValues> = useCallback(
        async (data: any) => {
            resetImageCaption();
            setLoading(true);
            const loadingToast = toast.loading('Sending image...', {
                position: 'bottom-center',
            });

            try {
                const secureUrl = await createSecureUrl(image?.src!);
                if (secureUrl !== null) {
                    const res = await axios.post(`/api/messages`, {
                        image: {
                            ...image,
                            src: secureUrl,
                            caption: data.caption,
                        },
                        conversationId,
                    });
                    toast.dismiss(loadingToast);
                    toast.success('Image sent!', { position: 'bottom-center' });
                    setImage(null);
                } else {
                    throw new Error('Unable to upload image');
                }
            } catch (error) {
                toast.dismiss(loadingToast);
                toast.error('Something went wrong!', {
                    position: 'bottom-center',
                });
            } finally {
                setLoading(false);
            }
        },
        [image?.src]
    );

    const cancelImageInput = () => {
        setImage(null);
    };

    return (
        <>
            <ImageInputModal
                image={image}
                cancelImageSend={cancelImageInput}
                register={registerImage}
                sendImageMessage={handleSubmitImage(handleImageSend)}
                loading={loading}
                conversationId={conversationId}
            />
            <form
                onSubmit={handleSubmitText(handleTextInputSend)}
                className="w-full pb-3 px-2 flex flex-col gap-2 relative"
            >
                <ChatScreenInput
                    id="message"
                    register={registerText}
                    handleImageChange={handleImageChange}
                    sendTextOnEnter={handleSubmitText(handleTextInputSend)}
                />
            </form>
        </>
    );
}

export default Form;
