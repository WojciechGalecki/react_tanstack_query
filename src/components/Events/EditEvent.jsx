import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const { id } = useParams();
  const submit = useSubmit();

  const { data, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: (signal) => fetchEvent({ id, signal }),
    staleTime: 10000, // useQuery will use cached data fetched before by the 'loader' function
  });

  function handleSubmit(formData) {
    submit(formData, { method: "PUT" }); // trigger for running 'action'function by react router
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message || "Failed to load event, please try later"
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Ok
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting" ? (
          <p>Sending data...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export function editEventLoader({ params }) {
  queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: (signal) => fetchEvent({ id: params.id, signal }),
  });
  return null;
}

export async function editEventAction({ request, params }) {
  const formData = await request.formData();
  const updatedEvent = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEvent });
  await queryClient.invalidateQueries(["events"]);
  return redirect("../");
}
