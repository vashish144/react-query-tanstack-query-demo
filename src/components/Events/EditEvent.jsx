import { Link, useNavigate, useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../utils/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const { data, isError, error, isPending } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id })
  })
  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['events'] })
      // navigate('../')
    },
    onMutate: async (data) => {
      const newEvent = data.event;
      await queryClient.cancelQueries({ queryKey: ["events", id] });
      const previousEvent = queryClient.getQueryData(["events", id]);
      queryClient.setQueryData(["events", id], newEvent);
      return { previousEvent };
    }
    , onError: (error, data, context) => {
      queryClient.setQueryData(["events", id], context.previousEvent);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["events", id] })
    }
  })

  function handleSubmit(formData) {
    mutate({ id, event: formData })
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (isPending) {

    content = <div className='center'>
      <LoadingIndicator />
    </div>
  }
  if (isError) {
    content = <>
      <ErrorBlock title={'Failed to load event'} message={error.info?.message || 'Failed to load event please try later'} />
      <div className='form-actions'>
        <Link to="../" className="button">
          ok
        </Link></div>
    </>
  }
  if (data) {
    content = <>
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    </>
  }
  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
