module todolist_addr::todolist {

  use aptos_framework::account;
  use aptos_framework::event;
  use std::signer;
  use std::vector;
  use std::string::String;
  #[test_only]
  use std::string;

  // Errors
  const E_NOT_INITIALIZED: u64 = 1;
  const ETASK_DOESNT_EXIST: u64 = 2;
  const ETASK_IS_COMPLETED: u64 = 3;

  struct TodoList has key {
    tasks: vector<Task>,
    set_task_event: event::EventHandle<Task>,
  }

  struct Task has store, drop, copy {
    address:address,
    content: String,
    completed: bool,
  }

  public entry fun create_list(account: &signer){
    let todo_list = TodoList {
      tasks: vector::empty(),
      set_task_event: account::new_event_handle<Task>(account),
    };
    // move the TodoList resource under the signer account
    move_to(account, todo_list);
  }

  public entry fun create_task(account: &signer, content: String) acquires TodoList {
    // gets the signer address
    let signer_address = signer::address_of(account);
    // assert signer has created a list
    assert!(exists<TodoList>(signer_address), E_NOT_INITIALIZED);
    // gets the TodoList resource
    let todo_list = borrow_global_mut<TodoList>(signer_address);
    // increment task counter
    // creates a new Task
    let new_task = Task {
      address: signer_address,
      content,
      completed: false
    };
    // adds the new task into the tasks table
    let length = vector::length(&todo_list.tasks);
    vector::insert(&mut todo_list.tasks, length, new_task);
    // sets the task counter to be the incremented counter
    // fires a new task created event
    event::emit_event<Task>(
      &mut borrow_global_mut<TodoList>(signer_address).set_task_event,
      new_task,
    );
  }

  public entry fun complete_task(account: &signer, task_id: u64) acquires TodoList {
    // gets the signer address
    let signer_address = signer::address_of(account);
		// assert signer has created a list
    assert!(exists<TodoList>(signer_address), E_NOT_INITIALIZED);
    // gets the TodoList resource
    let todo_list = borrow_global_mut<TodoList>(signer_address);
    // assert task exists
    assert!(task_id < vector::length(&todo_list.tasks), ETASK_DOESNT_EXIST);
    // gets the task matches the task_id
    let task_record = vector::borrow_mut(&mut todo_list.tasks, task_id);
    // assert task is not completed
    assert!(task_record.completed == false, ETASK_IS_COMPLETED);
    // update task as completed
    task_record.completed = true;
  }

  #[test(admin = @0x123)]
  public entry fun test_flow(admin: signer) acquires TodoList {
    // creates an admin @todolist_addr account for test
    account::create_account_for_test(signer::address_of(&admin));
    // initialize contract with admin account
    create_list(&admin);

    // creates a task by the admin account
    create_task(&admin, string::utf8(b"New Task"));
    let task_count = event::counter(&borrow_global<TodoList>(signer::address_of(&admin)).set_task_event);
    assert!(task_count == 1, 4);
    let todo_list = borrow_global<TodoList>(signer::address_of(&admin));
    assert!(vector::length(&todo_list.tasks) == 1, 5);
    let task_record = vector::borrow(&todo_list.tasks, vector::length(&todo_list.tasks) - 1);
    assert!(task_record.completed == false, 7);
    assert!(task_record.content == string::utf8(b"New Task"), 8);
    assert!(task_record.address == signer::address_of(&admin), 9);

    // updates task as completed
    complete_task(&admin, 0);
    let todo_list = borrow_global<TodoList>(signer::address_of(&admin));
    let task_record = vector::borrow(&todo_list.tasks, 0);
    assert!(task_record.completed == true, 11);
    assert!(task_record.content == string::utf8(b"New Task"), 12);
    assert!(task_record.address == signer::address_of(&admin), 13);
  }

  #[test(admin = @0x123)]
  #[expected_failure(abort_code = E_NOT_INITIALIZED)]
  public entry fun account_can_not_update_task(admin: signer) acquires TodoList {
    // creates an admin @todolist_addr account for test
    account::create_account_for_test(signer::address_of(&admin));
    // account can not toggle task as no list was created
    complete_task(&admin, 1);
  }

}
