import { TimerPresetRepository } from '../../repositories/timerPresetRepository.interface';
import { ProjectRepository } from '../../repositories/projectRepository.interface';
import { UserRepository } from '../../repositories/userRepository.interface';
import { UserEntity } from '../../entities/user.entity';
import { ProjectEntity } from '../../entities/project.entity';
import { TimerPresetEntity } from '../../entities/timer-preset.entity';

export class UserInitService {
  constructor(
    private readonly timerPresetRepository: TimerPresetRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
  ) {
    console.log('UserInitService constructor called');
  }

  /**
   * Initialize default settings for a new user
   * Creates default projects and timer presets
   */
  async initializeUser(user: UserEntity): Promise<void> {
    try {
      console.log('Initializing user defaults for:', user.email);
      console.log('User object structure:', JSON.stringify(user, null, 2));

      // Extract the user ID - MongoDB uses _id
      const userId = user.id?.toString();

      if (!userId) {
        console.error('User _id is missing during initialization');
        throw new Error('User _id is required for initialization');
      }

      console.log(`Starting initialization for user ID: ${userId}`);

      // Create default project (Focus)
      console.log('Creating default Focus project...');
      const focusProject = await this.createDefaultProject(userId);
      console.log('Default Focus project created:', focusProject?.id || 'failed');

      // Create default timer presets
      console.log('Creating default timer presets...');
      const defaultPresets = await this.createDefaultTimerPresets(userId);
      console.log('Default timer presets created:', defaultPresets.length);

      // Set default timer preset (Pomodoro)
      if (defaultPresets.length > 0) {
        const presetId = defaultPresets[0].id?.toString();

        if (presetId) {
          console.log('Setting default timer preset:', presetId);
          await this.setDefaultTimerPreset(userId, presetId);
          console.log('Default timer preset set successfully');
        } else {
          console.warn('Preset created but no _id found:', defaultPresets[0]);
        }
      } else {
        console.warn('No default presets were created, skipping default preset setting');
      }

      console.log(`Successfully initialized user: ${user.email}`);
    } catch (error) {
      console.error('Error initializing user:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }

  /**
   * Create the default "Focus" project for new users
   */
  private async createDefaultProject(userId: string): Promise<ProjectEntity> {
    console.log(`Creating Focus project for user ID: ${userId}`);

    const focusProject = {
      name: 'Focus',
      description: 'Default project for focused work sessions',
      color: '#33d17a',
      user: userId,
      status: 'active',
    } as ProjectEntity;

    try {
      const project = await this.projectRepository.create(focusProject);
      console.log('Focus project created successfully with ID:', project._id);
      return project;
    } catch (error) {
      console.error('Error creating Focus project:', error);
      throw error;
    }
  }

  /**
   * Create default timer presets for new users
   */
  private async createDefaultTimerPresets(userId: string): Promise<TimerPresetEntity[]> {
    console.log(`Creating default timer presets for user ID: ${userId}`);

    const pomodoroPreset = {
      name: '🍅 Pomodoro',
      workDuration: 25,
      breakDuration: 5,
      repetitions: 4,
      user: userId,
    } as TimerPresetEntity;

    const workBreakPreset = {
      name: '💻 52/17',
      workDuration: 52,
      breakDuration: 17,
      repetitions: 4,
      user: userId,
    } as TimerPresetEntity;

    try {
      console.log('Creating Pomodoro preset...');
      const pomodoro = await this.timerPresetRepository.create(pomodoroPreset);
      console.log('Pomodoro preset created with ID:', pomodoro._id);

      console.log('Creating 52/17 preset...');
      const workBreak = await this.timerPresetRepository.create(workBreakPreset);
      console.log('52/17 preset created with ID:', workBreak._id);

      const createdPresets = [pomodoro, workBreak];
      return createdPresets;
    } catch (error) {
      console.error('Error creating default timer presets:', error);
      throw error;
    }
  }

  /**
   * Set the default timer preset for a user
   */
  private async setDefaultTimerPreset(userId: string, presetId: string): Promise<void> {
    console.log(`Setting default timer preset ${presetId} for user ID: ${userId}`);

    try {
      // Update user with default timer preset
      const updateResult = await this.userRepository.update(userId, {
        defaultTimerPreset: presetId
      });

      console.log('User update result:', updateResult ? 'success' : 'failed');
    } catch (error) {
      console.error('Error setting default timer preset:', error);
      throw error;
    }
  }
}
