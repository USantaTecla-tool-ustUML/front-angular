import {Component, ElementRef, EventEmitter, Output, Renderer2, ViewChild} from '@angular/core';
import * as yaml from 'js-yaml';
import {CommandViewService} from './command-view.service';
import {CommandResponse} from '../command-response.model';
import {AuthService} from '../../shared/auth.service';
import ICodeEditor = monaco.editor.ICodeEditor;

@Component({
  selector: 'app-command-view',
  templateUrl: './command-view.component.html',
  styleUrls: ['./command-view.component.css']
})
export class CommandViewComponent {

  editorOptions = {theme: 'vs-dark', language: 'yaml', cursorWidth: 7};

  @Output() serverResponse = new EventEmitter<CommandResponse>();

  @ViewChild('terminal') terminal: ElementRef;

  input: {
    content: string;
    previousCommands: string[];
    selectedCommand: number;
  };

  output: {
    content: string;
    style: string;
  };

  constructor(private renderer: Renderer2, private userViewService: CommandViewService, private authService: AuthService) {
    this.input = {
      content: '',
      previousCommands: [],
      selectedCommand: 0
    };
    this.output = {
      content: '',
      style: ''
    };
  }

  onEditorInit(editor: ICodeEditor): void {
    editor.getModel().updateOptions({tabSize: 2});
  }

  keyEvent(e: KeyboardEvent): void {
    this.output.style = 'margin-block-start: 2em;';
    const keyMap = {
      Enter: (event) => {
        if (event.ctrlKey) {
          event.preventDefault();
          this.executeCommand();
        }
      },
      ArrowUp: (event) => {
        if (event.ctrlKey) {
          event.preventDefault();
          this.loadPreviousCommand(-1);
        }
      },
      ArrowDown: (event) => {
        if (event.ctrlKey) {
          event.preventDefault();
          this.loadPreviousCommand(1);
        }
      }
    };
    if (keyMap[e.code]) {
      keyMap[e.code](e);
    }
    this.terminal.nativeElement.scrollTop = this.terminal.nativeElement.scrollHeight;
  }

  executeCommandByButton(): void {
    if (this.input.content !== '') {
      this.input.content += '\r\n';
      this.executeCommand();
    }
  }

  public executeCommand(): void {
    const previousCommand = this.previousCommandBuilder();
    this.input.previousCommands.push(previousCommand);
    this.input.selectedCommand = this.input.previousCommands.length;
    this.showResponse();
    this.input.content = '';
  }

  private previousCommandBuilder(): string {
    const inputContent = this.input.content.split('\n');
    let previousCommand = '';
    const regexp = new RegExp('( )+\r');
    for (let i = 0; i < inputContent.length - 1; i++) {
      if (!regexp.test(inputContent[i]) && inputContent[i] !== '\r') {
        previousCommand += inputContent[i] + '\n';
      }
    }
    return previousCommand;
  }

  private showResponse(): void {
    const commands = {
      help: 'Available commands:<br/> \'clear\' \'help\' \'add:\' \'modify:\' \'delete:\' \'open:\' \'close\' \'import\'',
      'add:': 'Added successfully.',
      'modify:': 'Modified successfully.',
      'delete:': 'Deleted successfully.',
      'open:': 'Opened successfully.',
      'close:': 'Closed successfully.',
      'import:': 'Imported successfully.'
    };
    const command = this.input.content.split('\r\n')[0].split(' ')[0].split('\n')[0];
    this.output.style = 'margin-block-start: 2em; padding: 8px;';
    if (commands[command]) {
      if (command === 'help') {
        this.output.content = '<p>' + commands[command] + '</p>';
      } else {
        this.sendCommandToServer(commands[command], command);
      }
    } else if (command === 'clear') {
      this.output.content = '';
    } else {
      this.output.content = '<p>Command "' + command + '" not identified.<br/>To see command\'s list, write: help</p>';
    }
  }

  private sendCommandToServer(consoleResponse: string, command: string): void {
    try {
      const commandObject = yaml.load(this.input.content, {schema: yaml.JSON_SCHEMA});
      this.userViewService.sendCommand(commandObject)
        .subscribe((response) => {
          this.serverResponse.emit(response);
          this.output.content = '<p>' + consoleResponse + '</p>';
        }, error => {
          this.output.content = '<p>' + error + '</p>';
        });
      this.output.content = '<p>Executing...</p>';
    } catch (e) {
      this.output.content = '<p>' + e.name + ': Yaml syntax is not correct.</p>';
    }
  }

  public loadPreviousCommand(increment: number): void {
    const previousCommand = this.input.selectedCommand + increment;
    if (previousCommand >= 0 && previousCommand < this.input.previousCommands.length) {
      this.input.content = this.input.previousCommands[previousCommand];
      this.input.selectedCommand = previousCommand;
    }
  }

}
