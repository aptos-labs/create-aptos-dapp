import { Row, Col } from "antd";
import TaskInput from "../components/taskInput";
import Tasks from "../components/Tasks";
import { Task } from "../utils/types";

type ListViewProps = {
  setTransactionInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

export default function ListView({
  setTransactionInProgress,
  tasks,
  setTasks,
}: ListViewProps) {
  return (
    <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
      <TaskInput
        setTransactionInProgress={setTransactionInProgress}
        tasks={tasks}
        setTasks={setTasks}
      />
      <Col span={8} offset={8}>
        {tasks && (
          <Tasks
            setTransactionInProgress={setTransactionInProgress}
            tasks={tasks}
            setTasks={setTasks}
          />
        )}
      </Col>
    </Row>
  );
}
